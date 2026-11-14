import asyncio
from types import SimpleNamespace
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from backend.main import app
from backend import auth
from backend.api import compounds, search, analytics, graph
from backend.query_helpers import fetch_all

class Query:
    def __init__(self, db, table):
        self.db, self.table = db, table
        self.filters=[]; self.start=0; self.stop=None; self.with_count=False; self.head=False; self.expression=None
    def select(self, columns='*', count=None, head=False):
        self.with_count=count=='exact'; self.head=head; return self
    def eq(self, key, value): self.filters.append((key,value)); return self
    def in_(self, key, values): self.filters.append((key,set(values))); return self
    def order(self, *args, **kwargs): return self
    def limit(self, n): self.stop=n; return self
    def range(self, first, last): self.start=first; self.stop=last+1; return self
    def or_(self, expression): self.db.last_or=expression; self.expression=expression; return self
    def gte(self, *args): return self
    def lte(self, *args): return self
    def execute(self):
        self.db.calls.append(self.table)
        if self.db.fail: raise RuntimeError('source unavailable')
        if self.table not in self.db.tables: raise RuntimeError('unknown table')
        rows=self.db.tables[self.table]
        for key,value in self.filters:
            rows=[r for r in rows if r.get(key) in value] if isinstance(value,set) else [r for r in rows if r.get(key)==value]
        if self.expression:
            import re
            values=re.findall(r'(\w+)\.ilike\."%([^\"]*)%"',self.expression)
            rows=[r for r in rows if any(value.casefold() in str(r.get(key) or '').casefold() for key,value in values)]
        count=len(rows) if self.with_count else None
        end=min(self.stop or len(rows),self.start+self.db.cap)
        return SimpleNamespace(data=[] if self.head else [dict(r) for r in rows[self.start:end]],count=count)

class DB:
    def __init__(self,tables,cap=1000,fail=False):
        self.tables=tables; self.cap=cap; self.fail=fail; self.calls=[]; self.last_or=None
    def table(self,name): return Query(self,name)

def test_server_cap_is_not_treated_as_complete_data():
    db=DB({'records':[{'id':n} for n in range(13)]},cap=3)
    result=fetch_all(lambda: db.table('records').select('*',count='exact'),page_size=5)
    assert [r['id'] for r in result]==list(range(13))
    assert len(db.calls)==5

def test_compound_identifiers_never_use_contains_matching():
    db=DB({'annotations':[{'compound_id':'CMPD_A'},{'compound_id':'CMPD_A2'}]})
    assert compounds.robust_select_by_compound_id(db,'annotations','CMPD_A')==[{'compound_id':'CMPD_A'}]
    assert compounds.robust_select_by_compound_id(db,'annotations','CMPD_MISSING')==[]

def test_source_failure_is_not_converted_to_empty_evidence():
    with pytest.raises(RuntimeError): compounds.safe_select_many(DB({},fail=True),'annotations','CMPD_A')

def test_duplicate_singular_projection_is_explicit():
    with pytest.raises(HTTPException) as exc:
        compounds.safe_select_one(DB({'master':[{'compound_id':'A'},{'compound_id':'A'}]}),'master','A')
    assert exc.value.status_code==503

def test_compound_existence_is_decided_by_catalogue(monkeypatch):
    db=DB({'compound':[{'compound_id':'A','compound_name_raw':'record'}],
           'v_compound_master':[{'compound_id':'A'}],
           'v_compound_annotation_status':[{'compound_id':'A','identity_hold':True}],
           'v_plant_compound':[]})
    assert compounds.build_compound_detail(db,'A')['data_quality']['identity_hold']
    with pytest.raises(HTTPException) as exc: compounds.build_compound_detail(db,'missing')
    assert exc.value.status_code==404

def test_compound_chembl_response_reports_withheld_records(monkeypatch):
    db=DB({'v_compound_chembl':[{'compound_id':'A','standard_relation':'<'}],
           'compound_chembl_activity':[{'compound_id':'A'} for _ in range(3)]})
    monkeypatch.setattr(compounds,'get_db',lambda:db)
    result=asyncio.run(compounds.get_chembl('A'))
    assert result['quality_summary']['source_rows']==3
    assert result['quality_summary']['withheld_rows']==2
    assert result['data'][0]['standard_relation']=='<'

def test_global_search_uses_current_schema_and_quotes_punctuation(monkeypatch):
    db=DB({name:[] for name in ['plant_taxon','v_compound_master','v_target_summary','reference']})
    monkeypatch.setattr(search,'get_db',lambda:db)
    result=search.global_search('a,b()',None,20)
    assert set(result)=={'plants','compounds','targets','references'}
    assert '"%a,b()%"' in db.last_or
    assert 'compound_synonym' not in db.calls

def test_count_failure_is_not_reported_as_zero():
    with pytest.raises(HTTPException): analytics.safe_exact_count(DB({},fail=True),'compound','compound_id')

@pytest.mark.parametrize('url',[
    '/api/admin/submissions','/api/admin/access','/api/admin-collaboration/submissions',
    '/api/curation/submission/example/rows',
])
def test_private_routes_reject_anonymous_access_before_database_use(monkeypatch,url):
    monkeypatch.setattr(auth,'get_db',lambda:pytest.fail('database should not be accessed'))
    with TestClient(app) as client: assert client.get(url).status_code==401

def test_user_editable_metadata_cannot_grant_curator_access(monkeypatch):
    user=SimpleNamespace(id='ordinary-user',app_metadata={},user_metadata={'role':'admin'})
    db=SimpleNamespace(auth=SimpleNamespace(get_user=lambda token:SimpleNamespace(user=user)))
    monkeypatch.setattr(auth,'get_db',lambda:db)
    monkeypatch.delenv('CURATOR_USER_IDS',raising=False)
    with TestClient(app) as client:
        assert client.get('/api/admin/access',headers={'Authorization':'Bearer valid-session'}).status_code==403

def test_server_managed_curator_role_is_accepted(monkeypatch):
    user=SimpleNamespace(id='curator-user',app_metadata={'role':'curator'})
    db=SimpleNamespace(auth=SimpleNamespace(get_user=lambda token:SimpleNamespace(user=user)))
    monkeypatch.setattr(auth,'get_db',lambda:db)
    with TestClient(app) as client:
        assert client.get('/api/admin/access',headers={'Authorization':'Bearer valid-session'}).json()=={'allowed':True}

def test_optional_chat_credentials_do_not_block_api_startup(monkeypatch):
    monkeypatch.delenv('OPENAI_API_KEY',raising=False)
    with TestClient(app) as client:
        assert client.get('/api/health').status_code==200
        assert client.post('/api/chat',json={'message':'hello'}).status_code==503

def test_graph_search_filters_before_the_server_page_limit(monkeypatch):
    rows=[{'compound_id':'C1','gene_name':'OTHER','target_external_id':str(n),'score':500} for n in range(4000)]
    rows.append({'compound_id':'C1','gene_name':'LATE','target_external_id':'late-protein','score':500})
    monkeypatch.setattr(graph,'get_db',lambda:DB({'v_compound_target':rows},cap=3))
    result=asyncio.run(graph.get_focused_graph(q='LATE',graph_mode='compound_target',pool_limit=100,min_score=0))
    assert result['meta']['matched_rows']==1
    assert result['meta']['candidate_rows']==1
    assert result['edges'][0]['target']=='target::late-protein'

def test_graph_keeps_distinct_external_proteins_with_the_same_gene_label():
    result=graph.build_compound_target_graph([
        {'compound_id':'C1','gene_name':'GENE','target_external_id':'P1'},
        {'compound_id':'C1','gene_name':'GENE','target_external_id':'P2'},
    ])
    assert result['meta']['target_count']==2
    assert len(result['edges'])==2

def test_disputed_structure_downloads_are_withheld(monkeypatch):
    db=DB({'v_compound_annotation_status':[{'compound_id':'A','identity_hold':True}], 'compound_structure_files':[{'compound_id':'A','file_path':'disputed.sdf'}]})
    monkeypatch.setattr(compounds,'get_db',lambda:db)
    result=asyncio.run(compounds.get_structure_files('A'))
    assert result['data']==[] and result['status']=='withheld_identity_review'
    assert 'compound_structure_files' not in db.calls

def test_ambiguous_structure_downloads_are_withheld(monkeypatch):
    db=DB({'v_compound_annotation_status':[{'compound_id':'A','pubchem_candidate_count':2}]})
    monkeypatch.setattr(compounds,'get_db',lambda:db)
    assert asyncio.run(compounds.get_structure_files('A'))['status']=='withheld_identity_review'

def test_oversized_upload_is_rejected_before_storage(monkeypatch):
    from backend.api import collaboration
    class Upload:
        filename='data.csv'
        content_type='text/csv'
        async def read(self,size): return b'x'*size
    monkeypatch.setattr(collaboration,'get_db',lambda:DB({'collaboration_submissions':[{'submission_id':'S','status':'pending'}]}))
    monkeypatch.setattr(collaboration,'get_storage_client',lambda:pytest.fail('Oversized upload must not reach storage'))
    with pytest.raises(HTTPException) as exc:
        asyncio.run(collaboration.upload_collaboration_file(Upload(),'S'))
    assert exc.value.status_code==413

def test_absent_gene_catalogue_is_not_a_database_error():
    from backend.api import genes
    assert genes.list_genes()['available'] is False
