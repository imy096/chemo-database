# Applied ACPP database repairs — verified 15 November 2026

These six migrations are already recorded in the live Supabase project. This is an audit record, not a fresh-database bootstrap. Do not paste this whole document into SQL Editor or run the old March UUID bootstrap against the current text-ID database.

The application repairs were merged in PRs #1 and #2. Netlify published master@9b532c0; Render runs the unchanged backend from master@0fcca29. Anonymous curator access returns 401. Compound detail and list endpoints returned 200 after the lookup indexes were applied. A live database EXPLAIN ANALYZE of the ordered first 50 master rows completed in 280.698 ms; end-to-end HTTP requests also include hosting/network delay.

The index migration was checked against the full saved snapshot: the digest of all 5,850 compound results was identical before and after, 90,376 raw activity rows were preserved, 66,495 rows passed the existing format/linkage gate, and all 11 identity holds remained active. Format checks do not establish scientific validity.

Unresolved: malformed activity and source identity mappings, missing compound/plant parent evidence, ambiguous annotations and the MFAM_/MFK_ crosswalk. The 11 holds are known cases, not a complete identity audit. Further suspect name/structure assignments remain. No publication-ready scientific validation is claimed. Public research RLS/security-definer advisory work remains separate; the previously rejected broad access migration was not applied.

The legacy March migration files still in this repository describe a different UUID schema. They must not be executed on this production database. The database repair files below depend on the existing production schema and are retained here for review and reconstruction of change history.

## 20261114123119_repair_acpp_projection_joins.sql

```sql
-- Preserve every source row. A singular catalogue projection must not choose
-- between competing annotation records or multiply the catalogue cardinality.
CREATE OR REPLACE VIEW public.v_compound_master WITH (security_invoker = true) AS
WITH pubchem_records AS (
 SELECT DISTINCT compound_id,cid,molecular_formula,molecular_weight,smiles,inchikey,iupac_name,xlogp,tpsa
 FROM public.compound_pubchem_enrichment
), pubchem_single AS (
 SELECT p.* FROM pubchem_records p
 JOIN (SELECT compound_id FROM pubchem_records GROUP BY compound_id HAVING count(*)=1) one USING(compound_id)
), comptox_records AS (
 SELECT DISTINCT compound_id,dtxsid,dtxcid,logd55,logd74,ready_bio_deg
 FROM public.compound_comptox_physchem_reduced
), comptox_single AS (
 SELECT r.* FROM comptox_records r
 JOIN (SELECT compound_id FROM comptox_records GROUP BY compound_id HAVING count(*)=1) one USING(compound_id)
), kegg_agg AS (
 SELECT compound_id,
 string_agg(DISTINCT kegg_id,' | ' ORDER BY kegg_id) AS kegg_ids,
 string_agg(DISTINCT kegg_name,' | ' ORDER BY kegg_name) AS kegg_names,
 string_agg(DISTINCT kegg_pathway,' | ' ORDER BY kegg_pathway) AS kegg_pathways
 FROM public.compound_kegg_link GROUP BY compound_id
), chembl_agg AS (
 SELECT compound_id,string_agg(DISTINCT molecule_chembl_id,' | ' ORDER BY molecule_chembl_id) AS chembl_ids
 FROM public.compound_chembl_activity
 WHERE molecule_chembl_id ~ '^CHEMBL[0-9]+$'
 AND assay_chembl_id ~ '^CHEMBL[0-9]+$'
 AND (target_organism IS NULL OR target_organism !~ '^CHEMBL[0-9]+$')
 GROUP BY compound_id
)
SELECT c.compound_id,c.compound_name_raw,c.compound_name_normalized,
 p.cid AS pubchem_cid,p.molecular_formula,p.molecular_weight,p.smiles,p.inchikey,p.iupac_name,p.xlogp,p.tpsa,
 r.dtxsid,r.dtxcid,r.logd55,r.logd74,r.ready_bio_deg,
 k.kegg_ids,k.kegg_names,k.kegg_pathways,ch.chembl_ids
FROM public.compound c
LEFT JOIN pubchem_single p USING(compound_id)
LEFT JOIN comptox_single r USING(compound_id)
LEFT JOIN kegg_agg k USING(compound_id)
LEFT JOIN chembl_agg ch USING(compound_id);

-- Catalogue IDs, rather than a shared/misassigned PubChem CID, own source links.
CREATE OR REPLACE VIEW public.v_compound_target WITH (security_invoker = true) AS
SELECT c.compound_id,c.compound_name_raw,t.interaction_id,t.compound_pubchem_cid,
 t.target_external_id,t.gene_name,t.target_species,t.score,t.action,t.mode
FROM public.compound c JOIN public.compound_target_interaction t USING(compound_id);

CREATE OR REPLACE VIEW public.v_compound_annotation_status WITH (security_invoker = true) AS
WITH p AS (
 SELECT compound_id,count(*) AS candidate_count FROM (
  SELECT DISTINCT compound_id,cid,molecular_formula,molecular_weight,smiles,inchikey,iupac_name,xlogp,tpsa
  FROM public.compound_pubchem_enrichment
 ) x GROUP BY compound_id
), r AS (
 SELECT compound_id,count(*) AS candidate_count FROM (
  SELECT DISTINCT compound_id,dtxsid,dtxcid,logd55,logd74,ready_bio_deg
  FROM public.compound_comptox_physchem_reduced
 ) x GROUP BY compound_id
)
SELECT c.compound_id,coalesce(p.candidate_count,0) AS pubchem_candidate_count,
 coalesce(r.candidate_count,0) AS comptox_candidate_count,
 CASE WHEN coalesce(p.candidate_count,0)>1 OR coalesce(r.candidate_count,0)>1
 THEN 'ambiguous_annotations_held_from_singular_projection'
 ELSE 'source_annotations_not_independently_validated' END AS annotation_status
FROM public.compound c LEFT JOIN p USING(compound_id) LEFT JOIN r USING(compound_id);
GRANT SELECT ON public.v_compound_annotation_status TO anon,authenticated,service_role;

DO $$ BEGIN
 IF (SELECT count(*) FROM public.v_compound_master) <> (SELECT count(*) FROM public.compound)
 THEN RAISE EXCEPTION 'Compound projection changed catalogue cardinality'; END IF;
 IF EXISTS (SELECT 1 FROM public.v_compound_target v JOIN public.compound_target_interaction t USING(interaction_id)
            WHERE v.compound_id IS DISTINCT FROM t.compound_id)
 THEN RAISE EXCEPTION 'Target projection reassigned a source catalogue identifier'; END IF;
END $$;
```

## 20261114123259_repair_acpp_reference_links.sql

```sql
-- Provenance is unambiguous for these links: evidence_id and reference_id
-- are existing parent keys. Preserve the old rows privately before filling
-- only the redundant plant_id. Seven parentless evidence rows stay unresolved.
CREATE SCHEMA IF NOT EXISTS acpp_repair;
REVOKE ALL ON SCHEMA acpp_repair FROM PUBLIC,anon,authenticated;
CREATE TABLE IF NOT EXISTS acpp_repair.plant_reference_links_before_20261114 AS
 SELECT l.* FROM public.plant_attribute_reference_link l
 WHERE l.plant_id IS NULL AND EXISTS (
  SELECT 1 FROM public.plant_attribute_evidence e JOIN public.plant_taxon p USING(plant_id)
  WHERE e.evidence_id=l.evidence_id
 );
REVOKE ALL ON acpp_repair.plant_reference_links_before_20261114 FROM PUBLIC,anon,authenticated;
UPDATE public.plant_attribute_reference_link l SET plant_id=e.plant_id
FROM public.plant_attribute_evidence e JOIN public.plant_taxon p USING(plant_id)
WHERE l.evidence_id=e.evidence_id AND l.plant_id IS NULL
 AND EXISTS(SELECT 1 FROM acpp_repair.plant_reference_links_before_20261114 old
            WHERE old.evidence_id=l.evidence_id AND old.reference_id=l.reference_id
              AND old.reference_index=l.reference_index);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.plant_attribute_reference_link l
           JOIN public.plant_attribute_evidence e USING(evidence_id)
           JOIN public.plant_taxon p ON p.plant_id=e.plant_id
           WHERE l.plant_id IS NULL)
 THEN RAISE EXCEPTION 'Supported reference links remain unresolved'; END IF;
END $$;
```

## 20261114123900_quarantine_unresolved_activity_and_identity.sql

```sql
-- Preserve raw records and explicitly grade unresolved identities/activity.
CREATE TABLE IF NOT EXISTS public.compound_identity_review (
 compound_id text PRIMARY KEY REFERENCES public.compound(compound_id),
 review_status text NOT NULL, reason text NOT NULL, source_file text NOT NULL,
 active_hold boolean NOT NULL DEFAULT true, reviewed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.compound_identity_review ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.compound_identity_review FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.compound_identity_review TO anon,authenticated;
GRANT ALL ON public.compound_identity_review TO service_role;
CREATE POLICY acpp_identity_review_public_read ON public.compound_identity_review
 FOR SELECT TO anon,authenticated USING (true);
INSERT INTO public.compound_identity_review(compound_id,review_status,reason,source_file) VALUES
('CMPD_4C4DEE01F35D','NAME_STRUCTURE_CONFLICT','Catalogue anthraquinone name conflicts with an acyclic C11H23BrO brominated alcohol. No anthraquinone ring system.','Reviewed_Identity_Decisions_NOT_Predictions.csv'),
('CMPD_5603431E3B20','NAME_STRUCTURE_CONFLICT','Catalogue polyoxygenated flavone conflicts with C9H17NO cyclopentenyl amine. Fuzzy rekey also changed hydroxyl/methoxy positions.','Reviewed_Identity_Decisions_NOT_Predictions.csv'),
('CMPD_C3FA79F62F54','NAME_STRUCTURE_CONFLICT','Catalogue cadinol name conflicts with C7H12O3 ethyl (2S)-2-methyl-3-oxobutanoate. Intended cadinol isomer is unresolved.','Reviewed_Identity_Decisions_NOT_Predictions.csv'),
('CMPD_7CF12E5B8455','NAME_STRUCTURE_CONFLICT','Ficin assignment contains a pentadeuterated triphenyl dye cation, with five explicit isotopic hydrogens. No source supports this assignment as the named plant constituent.','Reviewed_Identity_Decisions_NOT_Predictions.csv'),
('CMPD_0734D77FBBD3','MERGED_REGISTRY_STEREO_AMBIGUITY','SDFs mapped to one compound include CID 1794427 and CID 5280633. PubChem naming aliases overlap. File 3_5-O-caffeoylquinic_acid.sdf contains a mono-caffeoyl formula C16H18O9. Original source numbering and stereochemistry must decide identity. No automatic CID substitution.','Reviewed_Identity_Decisions_NOT_Predictions.csv'),
('CMPD_2C0F5F48E9A1','NAME_STRUCTURE_CONFLICT','Catalogue cycloartane diol conflicts with acyclic C9H22O6P2 organophosphorus graph. Linked SDF repeats CID 12921477.','Reviewed_Identity_Decisions_NOT_Predictions.csv'),
('CMPD_DD71E86F259F','NAME_STRUCTURE_CONFLICT','Ursane is assigned CID 441014, alpha-cellobiose, formula C12H22O11. The current disaccharide graph cannot represent the named ursane triterpene skeleton. No corrected CID assigned.','Five_Additional_Identity_Or_Scope_Holds.csv'),
('CMPD_7BA5D729D81A','CLASS_NAME_INDIVIDUAL_STRUCTURE_UNRESOLVED','The plural class label Dihydrophenanthrenes does not establish that the reported plant constituent is the unsubstituted 9,10-dihydrophenanthrene graph. Require the exact reported molecule before modelling this association.','Five_Additional_Identity_Or_Scope_Holds.csv'),
('CMPD_4AC42FF0DAE0','NAME_STRUCTURE_CONFLICT','6''''-O-(3-hydroxy-3-methylglutaroyl)isoorientin is assigned an acyclic polyene ester C20H24O3. This graph lacks the named polyoxygenated flavone glycoside and HMG substituent. No corrected CID assigned.','Five_Additional_Identity_Or_Scope_Holds.csv'),
('CMPD_0798628B90A8','POLYMER_OR_REPRESENTATIVE_GRAPH_SCOPE_HOLD','Galactomannan is a heterogeneous polysaccharide class. PubChem recognizes the synonym for the supplied trisaccharide representation, so this is not asserted to be a wrong registry lookup. The fixed representative graph does not establish the exact plant material or its degree of polymerization and is unsuitable for an individual-small-compound claim without definition.','Five_Additional_Identity_Or_Scope_Holds.csv'),
('CMPD_3B54E4B81A95','NAME_STRUCTURE_CONFLICT','4-5-O-dicaffeoylquinic acid is assigned C16H17O9-, a mono-caffeoylquinic carboxylate. Protonation cannot supply the missing second caffeoyl group. No corrected CID assigned.','Five_Additional_Identity_Or_Scope_Holds.csv')
ON CONFLICT (compound_id) DO NOTHING;

CREATE OR REPLACE VIEW public.v_compound_activity_quality WITH (security_invoker=true) AS
SELECT md5(to_jsonb(ch)::text) AS record_fingerprint,ch.compound_id,
 array_remove(ARRAY[
  CASE WHEN ch.target_organism ~ '^CHEMBL[0-9]+$' OR ch.assay_chembl_id IN ('B','F','A','T','P','U') THEN 'shifted_fields' END,
  CASE WHEN c.compound_id IS NULL THEN 'missing_catalogue_parent' END,
  CASE WHEN h.active_hold THEN 'identity_or_scope_hold' END,
  CASE WHEN ch.molecule_chembl_id IS NULL OR ch.molecule_chembl_id !~ '^CHEMBL[0-9]+$' THEN 'invalid_molecule_identifier' END,
  CASE WHEN ch.assay_chembl_id IS NULL OR ch.assay_chembl_id !~ '^CHEMBL[0-9]+$' THEN 'invalid_assay_identifier' END
 ],NULL) AS issue_flags,
 'source_experiment_not_independently_validated'::text AS evidence_status
FROM public.compound_chembl_activity ch
LEFT JOIN public.compound c USING(compound_id)
LEFT JOIN public.compound_identity_review h USING(compound_id);
GRANT SELECT ON public.v_compound_activity_quality TO anon,authenticated,service_role;

-- Preserve the original eleven columns, then add the missing censoring,
-- source and audit fields. Never show a shifted row as a measured endpoint.
CREATE OR REPLACE VIEW public.v_compound_chembl WITH (security_invoker=true) AS
SELECT c.compound_id,c.compound_name_raw,ch.molecule_chembl_id,ch.target_chembl_id,
 ch.target_pref_name,ch.target_organism,ch.assay_chembl_id,ch.standard_type,
 ch.standard_value,ch.standard_units,ch.pchembl_value,
 ch.standard_relation,ch.assay_type,ch.assay_description,ch.document_chembl_id,
 ch.inchikey AS reported_inchikey,md5(to_jsonb(ch)::text) AS record_fingerprint,
 'format_checked_source_unverified'::text AS validation_status
FROM public.compound c JOIN public.compound_chembl_activity ch USING(compound_id)
WHERE NOT coalesce(ch.target_organism ~ '^CHEMBL[0-9]+$',false)
 AND ch.molecule_chembl_id ~ '^CHEMBL[0-9]+$'
 AND ch.assay_chembl_id ~ '^CHEMBL[0-9]+$'
 AND NOT EXISTS (SELECT 1 FROM public.compound_identity_review h WHERE h.compound_id=c.compound_id AND h.active_hold);

CREATE OR REPLACE VIEW public.v_compound_master WITH (security_invoker = true) AS
WITH pubchem_records AS (
 SELECT DISTINCT compound_id,cid,molecular_formula,molecular_weight,smiles,inchikey,iupac_name,xlogp,tpsa
 FROM public.compound_pubchem_enrichment
), pubchem_single AS (
 SELECT p.* FROM pubchem_records p
 JOIN (SELECT compound_id FROM pubchem_records GROUP BY compound_id HAVING count(*)=1) one USING(compound_id)
 WHERE NOT EXISTS(SELECT 1 FROM public.compound_identity_review h WHERE h.compound_id=p.compound_id AND h.active_hold)
), comptox_records AS (
 SELECT DISTINCT compound_id,dtxsid,dtxcid,logd55,logd74,ready_bio_deg
 FROM public.compound_comptox_physchem_reduced
), comptox_single AS (
 SELECT r.* FROM comptox_records r
 JOIN (SELECT compound_id FROM comptox_records GROUP BY compound_id HAVING count(*)=1) one USING(compound_id)
 WHERE NOT EXISTS(SELECT 1 FROM public.compound_identity_review h WHERE h.compound_id=r.compound_id AND h.active_hold)
), kegg_agg AS (
 SELECT compound_id,
 string_agg(DISTINCT kegg_id,' | ' ORDER BY kegg_id) AS kegg_ids,
 string_agg(DISTINCT kegg_name,' | ' ORDER BY kegg_name) AS kegg_names,
 string_agg(DISTINCT kegg_pathway,' | ' ORDER BY kegg_pathway) AS kegg_pathways
 FROM public.compound_kegg_link GROUP BY compound_id
), chembl_agg AS (
 SELECT compound_id,string_agg(DISTINCT molecule_chembl_id,' | ' ORDER BY molecule_chembl_id) AS chembl_ids
 FROM public.compound_chembl_activity
 WHERE molecule_chembl_id ~ '^CHEMBL[0-9]+$'
 AND assay_chembl_id ~ '^CHEMBL[0-9]+$'
 AND (target_organism IS NULL OR target_organism !~ '^CHEMBL[0-9]+$')
 AND NOT EXISTS(SELECT 1 FROM public.compound_identity_review h WHERE h.compound_id=compound_chembl_activity.compound_id AND h.active_hold)
 GROUP BY compound_id
)
SELECT c.compound_id,c.compound_name_raw,c.compound_name_normalized,
 p.cid AS pubchem_cid,p.molecular_formula,p.molecular_weight,p.smiles,p.inchikey,p.iupac_name,p.xlogp,p.tpsa,
 r.dtxsid,r.dtxcid,r.logd55,r.logd74,r.ready_bio_deg,
 k.kegg_ids,k.kegg_names,k.kegg_pathways,ch.chembl_ids
FROM public.compound c
LEFT JOIN pubchem_single p USING(compound_id)
LEFT JOIN comptox_single r USING(compound_id)
LEFT JOIN kegg_agg k USING(compound_id)
LEFT JOIN chembl_agg ch USING(compound_id);

CREATE OR REPLACE VIEW public.v_compound_annotation_status WITH (security_invoker = true) AS
WITH p AS (
 SELECT compound_id,count(*) AS candidate_count FROM (
  SELECT DISTINCT compound_id,cid,molecular_formula,molecular_weight,smiles,inchikey,iupac_name,xlogp,tpsa
  FROM public.compound_pubchem_enrichment
 ) x GROUP BY compound_id
), r AS (
 SELECT compound_id,count(*) AS candidate_count FROM (
  SELECT DISTINCT compound_id,dtxsid,dtxcid,logd55,logd74,ready_bio_deg
  FROM public.compound_comptox_physchem_reduced
 ) x GROUP BY compound_id
)
SELECT c.compound_id,coalesce(p.candidate_count,0) AS pubchem_candidate_count,
 coalesce(r.candidate_count,0) AS comptox_candidate_count,
 CASE WHEN coalesce(p.candidate_count,0)>1 OR coalesce(r.candidate_count,0)>1
 THEN 'ambiguous_annotations_held_from_singular_projection'
 ELSE 'source_annotations_not_independently_validated' END AS annotation_status, h.review_status AS identity_review_status, h.reason AS identity_hold_reason,coalesce(h.active_hold,false) AS identity_hold
FROM public.compound c LEFT JOIN p USING(compound_id) LEFT JOIN r USING(compound_id) LEFT JOIN public.compound_identity_review h USING(compound_id);

DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.v_compound_chembl WHERE target_organism ~ '^CHEMBL[0-9]+$')
 THEN RAISE EXCEPTION 'Shifted assay rows remain in the application view'; END IF;
 IF (SELECT count(*) FROM public.compound_chembl_activity) <> 90376
 THEN RAISE EXCEPTION 'The source snapshot changed; review this migration against the new version'; END IF;
END $$;
```

## 20261114124906_protect_private_submission_tables.sql

```sql
-- Narrow scope: only five private submission tables. Research-table grants,
-- research RLS, sequences and all views are unchanged by this migration.
ALTER TABLE public.collaboration_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.collaboration_submissions FROM PUBLIC,anon;
REVOKE TRUNCATE,REFERENCES,TRIGGER ON public.collaboration_submissions FROM authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.collaboration_submissions TO authenticated;
CREATE POLICY acpp_curator_access ON public.collaboration_submissions FOR ALL TO authenticated
USING (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'))
WITH CHECK (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'));
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.submission_files FROM PUBLIC,anon;
REVOKE TRUNCATE,REFERENCES,TRIGGER ON public.submission_files FROM authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.submission_files TO authenticated;
CREATE POLICY acpp_curator_access ON public.submission_files FOR ALL TO authenticated
USING (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'))
WITH CHECK (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'));
ALTER TABLE public.submission_structured_rows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.submission_structured_rows FROM PUBLIC,anon;
REVOKE TRUNCATE,REFERENCES,TRIGGER ON public.submission_structured_rows FROM authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.submission_structured_rows TO authenticated;
CREATE POLICY acpp_curator_access ON public.submission_structured_rows FOR ALL TO authenticated
USING (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'))
WITH CHECK (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'));
ALTER TABLE public.submission_validation_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.submission_validation_reports FROM PUBLIC,anon;
REVOKE TRUNCATE,REFERENCES,TRIGGER ON public.submission_validation_reports FROM authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.submission_validation_reports TO authenticated;
CREATE POLICY acpp_curator_access ON public.submission_validation_reports FOR ALL TO authenticated
USING (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'))
WITH CHECK (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'));
ALTER TABLE public.submission_parsed_rows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.submission_parsed_rows FROM PUBLIC,anon;
REVOKE TRUNCATE,REFERENCES,TRIGGER ON public.submission_parsed_rows FROM authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.submission_parsed_rows TO authenticated;
CREATE POLICY acpp_curator_access ON public.submission_parsed_rows FOR ALL TO authenticated
USING (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'))
WITH CHECK (((select auth.jwt())->'app_metadata'->>'role') IN ('admin','curator'));
```

## 20261114124952_add_reference_statistics_rpc.sql

```sql
CREATE OR REPLACE FUNCTION public.get_acpp_publication_stats()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = pg_catalog,public AS $$
 SELECT jsonb_build_object('total_publications',(SELECT count(*) FROM public.reference),
 'count_scope','stored reference records; not independently deduplicated publications',
 'top_journals',coalesce((SELECT jsonb_agg(to_jsonb(x)) FROM
  (SELECT journal,count(*) AS count FROM public.reference WHERE nullif(trim(journal),'') IS NOT NULL
   GROUP BY journal ORDER BY count(*) DESC,journal LIMIT 10) x),'[]'::jsonb));
$$;
REVOKE ALL ON FUNCTION public.get_acpp_publication_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_acpp_publication_stats() TO anon,authenticated,service_role;
```

## 20261115113914_index_acpp_compound_evidence_lookups.sql

```sql
-- Index only the four compound-evidence lookup paths used by the portal.
-- The partial index exactly preserves the existing ChEMBL format gate.
SET LOCAL lock_timeout = '3s';
CREATE INDEX IF NOT EXISTS acpp_pubchem_compound_lookup_idx ON public.compound_pubchem_enrichment(compound_id);
CREATE INDEX IF NOT EXISTS acpp_comptox_compound_lookup_idx ON public.compound_comptox_physchem_reduced(compound_id);
CREATE INDEX IF NOT EXISTS acpp_kegg_compound_lookup_idx ON public.compound_kegg_link(compound_id);
CREATE INDEX IF NOT EXISTS acpp_chembl_compound_lookup_idx ON public.compound_chembl_activity(compound_id);
CREATE INDEX IF NOT EXISTS acpp_chembl_formatted_molecule_idx ON public.compound_chembl_activity(compound_id,molecule_chembl_id)
WHERE molecule_chembl_id ~ '^CHEMBL[0-9]+$'
 AND assay_chembl_id ~ '^CHEMBL[0-9]+$'
 AND (target_organism IS NULL OR target_organism !~ '^CHEMBL[0-9]+$');
```

