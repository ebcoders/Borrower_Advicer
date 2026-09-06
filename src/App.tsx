import { useState } from 'react';
import { runAssessment, AssessmentAnswers } from './rules';
import { ChevronRight, ArrowLeft, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(1);
  
  // State
  const [purpose, setPurpose] = useState('medical');
  const [amountWanted, setAmountWanted] = useState<number>(100000);
  const [tenure, setTenure] = useState<number>(60);
  
  const [incomeType, setIncomeType] = useState('salaried');
  const [declaredIncome, setDeclaredIncome] = useState<number>(50000);
  const [itrIncome, setItrIncome] = useState<number | ''>('');
  
  const [expenses, setExpenses] = useState<number | ''>('');
  const [existingEmi, setExistingEmi] = useState<number>(0);
  const [missedPayments, setMissedPayments] = useState(false);
  const [savingsMonths, setSavingsMonths] = useState<number | ''>('');
  
  const [creditScore, setCreditScore] = useState<number | ''>('');
  const [ownsProperty, setOwnsProperty] = useState(false);
  const [propertyValue, setPropertyValue] = useState<number | ''>('');

  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const answers: AssessmentAnswers = {
      purpose,
      amount_wanted: amountWanted,
      tenure_months: tenure,
      income_type: incomeType,
      declared_income: declaredIncome,
      itr_income: itrIncome === '' ? null : Number(itrIncome),
      expenses: expenses === '' ? null : Number(expenses),
      existing_emi: existingEmi,
      missed_payments: missedPayments,
      savings_months: savingsMonths === '' ? null : Number(savingsMonths),
      credit_score: creditScore === '' ? null : Number(creditScore),
      owns_property: ownsProperty,
      property_value: propertyValue === '' ? null : Number(propertyValue)
    };
    setResult(runAssessment(answers));
    setStep(4);
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-serif text-ink border-b border-line pb-2">Step 1: The Goal</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">What do you need the loan for?</label>
        <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors">
          <option value="medical">Medical Emergency</option>
          <option value="education">Education</option>
          <option value="business">Business / Income generation</option>
          <option value="vehicle_for_income">Vehicle (for work/delivery)</option>
          <option value="home_improvement">Home Repair</option>
          <option value="wedding">Wedding</option>
          <option value="debt_consolidation">Pay off other debt</option>
          <option value="speculative">Stock market / Crypto / Gambling</option>
          <option value="other">Other Personal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">How much do you want to borrow? (Rs)</label>
        <input type="number" value={amountWanted} onChange={e => setAmountWanted(Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" step="10000" min="0" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Over how many months?</label>
        <select value={tenure} onChange={e => setTenure(Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors">
          <option value="12">1 Year (12 mo)</option>
          <option value="24">2 Years (24 mo)</option>
          <option value="36">3 Years (36 mo)</option>
          <option value="48">4 Years (48 mo)</option>
          <option value="60">5 Years (60 mo)</option>
          <option value="120">10 Years (120 mo) - LAP/Home only</option>
        </select>
      </div>

      <button onClick={() => setStep(2)} className="w-full bg-ink text-white p-4 rounded flex justify-between items-center hover:bg-ink/90 transition-colors">
        <span className="font-medium">Next: Your Income</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center space-x-3 border-b border-line pb-2">
        <button onClick={() => setStep(1)} className="p-1 hover:bg-black/5 rounded"><ArrowLeft size={20} /></button>
        <h2 className="text-2xl font-serif text-ink">Step 2: Income</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Employment Type</label>
        <div className="flex flex-col space-y-3">
          {[
            {l: 'Salaried (Regular Paycheck)', v: 'salaried'},
            {l: 'Self-Employed (Business Owner)', v: 'self_employed'},
            {l: 'Informal / Gig Worker', v: 'informal'}
          ].map(o => (
            <label key={o.v} className="flex items-center space-x-3 p-3 border border-line rounded cursor-pointer hover:bg-black/5 transition-colors">
              <input type="radio" name="incomeType" checked={incomeType === o.v} onChange={() => setIncomeType(o.v)} className="text-gold focus:ring-gold w-4 h-4" />
              <span>{o.l}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {incomeType === 'salaried' ? 'Net Monthly Take-Home (Rs)' : 'Average Monthly Income (Rs)'}
        </label>
        <input type="number" value={declaredIncome} onChange={e => setDeclaredIncome(Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" step="1000" min="0" />
      </div>

      {incomeType !== 'salaried' && (
        <div className="bg-paper p-4 rounded border border-line">
          <label className="block text-sm font-medium mb-1">Latest ITR Annual Declared Income (Rs)</label>
          <p className="text-xs text-ink/60 mb-2">Leave blank if you don't file an ITR or don't know. (Note: Skipping this widens your estimate ranges).</p>
          <input type="number" value={itrIncome} onChange={e => setItrIncome(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" step="10000" min="0" placeholder="e.g. 500000" />
        </div>
      )}

      <button onClick={() => setStep(3)} className="w-full bg-ink text-white p-4 rounded flex justify-between items-center hover:bg-ink/90 transition-colors">
        <span className="font-medium">Next: Obligations</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center space-x-3 border-b border-line pb-2">
        <button onClick={() => setStep(2)} className="p-1 hover:bg-black/5 rounded"><ArrowLeft size={20} /></button>
        <h2 className="text-2xl font-serif text-ink">Step 3: Obligations & Profile</h2>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Total Existing EMIs per month (Rs)</label>
        <input type="number" value={existingEmi} onChange={e => setExistingEmi(Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" step="500" min="0" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Essential Monthly Living Expenses (Rs)</label>
        <p className="text-xs text-ink/60 mb-2">Rent, food, school, bills. Leave blank to let the system guess conservatively.</p>
        <input type="number" value={expenses} onChange={e => setExpenses(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" step="1000" min="0" placeholder="e.g. 25000" />
      </div>

      <div className="p-4 bg-brick/10 border border-brick/20 rounded">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input type="checkbox" checked={missedPayments} onChange={e => setMissedPayments(e.target.checked)} className="mt-1 w-4 h-4 text-brick" />
          <span className="text-sm font-medium text-brick">I have missed or bounced a loan/card payment in the last 3 months.</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Emergency Savings</label>
          <p className="text-xs text-ink/60 mb-2">(Months of expenses)</p>
          <input type="number" value={savingsMonths} onChange={e => setSavingsMonths(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" min="0" step="1" placeholder="Optional" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Credit Score</label>
          <p className="text-xs text-ink/60 mb-2">e.g. CIBIL (300-900)</p>
          <input type="number" value={creditScore} onChange={e => setCreditScore(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" min="300" max="900" step="1" placeholder="Unknown" />
        </div>
      </div>

      <div>
        <label className="flex items-start space-x-3 cursor-pointer mb-3">
          <input type="checkbox" checked={ownsProperty} onChange={e => setOwnsProperty(e.target.checked)} className="mt-1 w-4 h-4 text-gold" />
          <span className="text-sm font-medium">I own unencumbered property (Land, Home, Shop)</span>
        </label>
        {ownsProperty && (
          <div className="pl-7">
            <label className="block text-sm font-medium mb-1">Approximate Value (Rs)</label>
            <input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-line rounded bg-white outline-none focus:border-gold transition-colors" step="100000" min="0" />
          </div>
        )}
      </div>

      <button onClick={handleCalculate} className="w-full bg-forest text-white p-4 rounded flex justify-center items-center hover:bg-forest/90 transition-colors">
        <span className="font-medium">Get My Assessment</span>
      </button>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
        <div className="flex items-center space-x-3 border-b border-line pb-2">
          <button onClick={() => setStep(3)} className="p-1 hover:bg-black/5 rounded"><ArrowLeft size={20} /></button>
          <h2 className="text-2xl font-serif text-ink">Your Assessment</h2>
        </div>

        {/* VERDICT HEADER */}
        <div className="text-center space-y-3">
          {result.verdict === 'borrow' && <div className="inline-flex items-center justify-center space-x-2 text-forest bg-forest/10 px-4 py-2 rounded-full"><CheckCircle size={24} /><span className="text-xl font-bold font-serif tracking-wide uppercase">Borrow</span></div>}
          {result.verdict === 'borrow_less' && <div className="inline-flex items-center justify-center space-x-2 text-gold bg-gold/10 px-4 py-2 rounded-full"><AlertTriangle size={24} /><span className="text-xl font-bold font-serif tracking-wide uppercase">Borrow Less</span></div>}
          {result.verdict === 'dont_borrow' && <div className="inline-flex items-center justify-center space-x-2 text-brick bg-brick/10 px-4 py-2 rounded-full"><ShieldAlert size={24} /><span className="text-xl font-bold font-serif tracking-wide uppercase">Don't Borrow</span></div>}
          
          <p className="text-lg text-ink/80 max-w-lg mx-auto">{result.verdict_reason}</p>
        </div>

        {/* CONSEQUENCES OF SILENCE */}
        {result.consequences.length > 0 && (
          <div className="bg-paper border border-gold/30 rounded p-4 space-y-3">
            <h4 className="flex items-center space-x-2 font-medium text-gold"><Info size={18} /> <span>The Cost of Missing Information</span></h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-ink/70">
              {result.consequences.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {/* CORE NUMBERS - Only show if not a hard decline */}
        {result.verdict !== 'dont_borrow' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-line rounded p-5 bg-white">
                <p className="text-sm font-medium text-ink/60 uppercase tracking-wider mb-1">A bank may sanction</p>
                <p className="font-serif text-2xl text-ink">Rs {result.lender_sanction_range[0].toLocaleString('en-IN')} - {result.lender_sanction_range[1].toLocaleString('en-IN')}</p>
                <p className="text-xs text-ink/50 mt-2">Based strictly on gross income FOIR limits.</p>
              </div>
              <div className="border-2 border-forest/30 rounded p-5 bg-forest/5 relative">
                <span className="absolute -top-3 right-4 bg-forest text-white text-[10px] font-bold tracking-widest px-2 py-0.5 uppercase rounded">Safe Limit</span>
                <p className="text-sm font-medium text-ink/60 uppercase tracking-wider mb-1">You can safely carry</p>
                <p className="font-serif text-2xl text-forest font-bold">Rs {result.safe_carry_range[0].toLocaleString('en-IN')} - {result.safe_carry_range[1].toLocaleString('en-IN')}</p>
                <p className="text-xs text-ink/50 mt-2">Protects your living expenses and a safety buffer.</p>
              </div>
            </div>

            <div className="border border-line rounded overflow-hidden">
              <div className="bg-paper p-3 border-b border-line flex justify-between items-center">
                <span className="font-medium text-sm">Product Route</span>
                <span className="font-serif font-semibold">{result.product_route}</span>
              </div>
              <div className="bg-white p-3 border-b border-line flex justify-between items-center">
                <span className="font-medium text-sm">Fair Interest Rate</span>
                <span className="font-serif font-semibold text-lg">{result.fair_rate_band[0].toFixed(1)}% - {result.fair_rate_band[1].toFixed(1)}%</span>
              </div>
              <div className="bg-white p-3 border-b border-line flex justify-between items-center">
                <span className="font-medium text-sm">Safe EMI Ceiling</span>
                <span className="font-serif font-semibold text-lg">Rs {result.negotiation_card.max_emi.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-paper p-4 text-sm text-ink/80 flex items-start space-x-3">
                <AlertTriangle size={18} className="text-gold shrink-0 mt-0.5" />
                <p>{result.stress_test.text}</p>
              </div>
            </div>

            {/* NEGOTIATION CARD */}
            <div className="bg-ink text-white rounded p-6 shadow-xl relative mt-10">
               <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-bold tracking-widest px-4 py-1.5 uppercase rounded-full shadow-md">
                Negotiation Card
              </span>
              
              <div className="grid sm:grid-cols-2 gap-8 mt-4">
                <div className="space-y-4">
                  <h4 className="text-gold font-medium uppercase tracking-wider text-sm border-b border-white/20 pb-2">Your Targets</h4>
                  <div>
                    <p className="text-white/60 text-xs">Target Amount</p>
                    <p className="font-serif text-xl">Rs {result.negotiation_card.recommended_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Target Rate</p>
                    <p className="font-serif text-xl">{result.negotiation_card.fair_rate}</p>
                    <p className="text-gold text-[10px] mt-1">{result.negotiation_card.apr_note}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Absolute Max EMI</p>
                    <p className="font-serif text-xl">Rs {result.negotiation_card.max_emi.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-forest font-medium uppercase tracking-wider text-sm border-b border-white/20 pb-2 mb-3">Ask The Lender</h4>
                    <ul className="space-y-2">
                      {result.negotiation_card.ask.map((item: string, i: number) => (
                        <li key={i} className="text-sm flex items-start space-x-2">
                          <span className="text-forest mt-0.5">•</span><span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-brick font-medium uppercase tracking-wider text-sm border-b border-white/20 pb-2 mb-3">Do Not Accept</h4>
                    <ul className="space-y-2">
                      {result.negotiation_card.reject.map((item: string, i: number) => (
                        <li key={i} className="text-sm flex items-start space-x-2">
                          <span className="text-brick mt-0.5">✕</span><span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink tracking-tight mb-2">Borrower Copilot</h1>
        <p className="text-sm text-ink/70">A neutral assessment of what you can safely afford, before you walk into the bank.</p>
      </header>

      <main className="flex-grow">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderResults()}
      </main>
    </div>
  );
}
