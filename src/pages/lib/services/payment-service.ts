import { supabase } from '@/lib/supabase';

export async function getInvoicesForSchool(schoolId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      students!inner(
        id,
        user_profiles:user_id(full_name)
      )
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPaymentsForSchool(schoolId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      students!inner(
        id,
        user_profiles:user_id(full_name)
      ),
      invoices(invoice_number)
    `)
    .eq('school_id', schoolId)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getStudentsForSchool(schoolId: string) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles:user_id(full_name, email)
    `)
    .eq('school_id', schoolId)
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

export function generateInvoiceNumber(): string {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

export async function createInvoice(data: {
  school_id: string;
  student_id: string;
  amount: number;
  tax_amount: number;
  due_date: string;
  notes: string;
  line_items: any[];
}) {
  const totalAmount = data.amount + data.tax_amount;

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      school_id: data.school_id,
      student_id: data.student_id,
      invoice_number: generateInvoiceNumber(),
      amount: data.amount,
      tax_amount: data.tax_amount,
      total_amount: totalAmount,
      currency: 'USD',
      status: 'sent',
      due_date: data.due_date,
      notes: data.notes,
      line_items: data.line_items,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return invoice;
}

export async function recordPayment(data: {
  school_id: string;
  student_id: string;
  invoice_id?: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  notes: string;
}) {
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      school_id: data.school_id,
      student_id: data.student_id,
      invoice_id: data.invoice_id || null,
      amount: data.amount,
      currency: 'USD',
      payment_method: data.payment_method,
      transaction_id: data.transaction_id,
      status: 'completed',
      payment_date: new Date().toISOString(),
      notes: data.notes,
    } as any)
    .select()
    .single();

  if (paymentError) throw paymentError;

  if (data.invoice_id) {
    await updateInvoiceStatus(data.invoice_id);
  }

  return payment;
}

export async function updateInvoiceStatus(invoiceId: string) {
  const { data: invoice } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('id', invoiceId)
    .single();

  if (!invoice) return;

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)
    .eq('status', 'completed');

  const totalPaid = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  let newStatus = 'sent';
  if (totalPaid >= invoice.total_amount) {
    newStatus = 'paid';
  }

  await supabase
    .from('invoices')
    .update({
      status: newStatus,
      paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
    })
    .eq('id', invoiceId);
}

export async function markInvoiceOverdue(invoiceId: string) {
  const { error } = await supabase.from('invoices').update({ status: 'overdue' }).eq('id', invoiceId);

  if (error) throw error;
}

export function calculatePaymentMetrics(invoices: any[], payments: any[]) {
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const unpaidInvoices = invoices.filter((inv) => inv.status === 'sent' || inv.status === 'overdue');
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    overdueInvoices,
    unpaidInvoices,
    totalOverdue,
    totalRevenue,
  };
}
