import { useState } from 'react';
import { runAssessment, AssessmentAnswers } from './rules';
import { ArrowRight, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Calculator, AlertCircle, FileText, Banknote } from 'lucide-react';

function App() {
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState('medical');
  const [loanTypeWanted, setLoanTypeWanted] = useState('personal');
  const [amountWanted, setAmountWanted] = useState<number | ''>(500000);
  const [quotedRate, setQuotedRate] = useState<number | ''>('');
  const [tenureMonths, setTenureMonths] = useState<number | ''>(60);
  const [age, setAge] = useState<number | ''>('');
  const [incomeType, setIncomeType] = useState('salaried');
  const [declaredIncome, setDeclaredIncome] = useState<number | ''>(50000);
  const [coApplicantIncome, setCoApplicantIncome] = useState<number | ''>('');
  const [coApplicantSalaried, setCoApplicantSalaried] = useState(true);
  const [variableIncomePct, setVariableIncomePct] = useState<number | ''>(30);
  const [yearsInIncome, setYearsInIncome] = useState<number | ''>(3);
  const [itrIncome, setItrIncome] = useState<number | ''>('');
  const [expenses, setExpenses] = useState<number | ''>('');
  const [existingEmi, setExistingEmi] = useState<number | ''>('');
  const [hasPredatoryLoans, setHasPredatoryLoans] = useState(false);
  const [creditStatus, setCreditStatus] = useState<'known' | 'unknown' | 'ntc'>('known');
  const [creditScore, setCreditScore] = useState<number | ''>(750);
  const [missedPayments, setMissedPayments] = useState(false);
  const [savingsMonths, setSavingsMonths] = useState<number | ''>(3);
  const [ownsProperty, setOwnsProperty] = useState(false);
  const [pledgeProperty, setPledgeProperty] = useState(false);
  const [propertyValue, setPropertyValue] = useState<number | ''>('');

  const [result, setResult] = useState<ReturnType<typeof runAssessment> | null>(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      const answers: AssessmentAnswers = {
        purpose,
        loan_type_wanted: loanTypeWanted,
        amount_wanted: Number(amountWanted) || 0,
        quoted_rate: quotedRate === '' ? null : Number(quotedRate),
        tenure_months: Number(tenureMonths) || 60,
        age: age === '' ? null : Number(age),
        income_type: incomeType,
        declared_income: Number(declaredIncome) || 0,
        co_applicant_income: coApplicantIncome === '' ? null : Number(coApplicantIncome),
        co_applicant_salaried: coApplicantSalaried,
        variable_income_pct: variableIncomePct === '' ? null : Number(variableIncomePct),
        years_in_income: yearsInIncome === '' ? null : Number(yearsInIncome),
        itr_income: itrIncome === '' ? null : Number(itrIncome),
        expenses: expenses === '' ? null : Number(expenses),
        existing_emi: existingEmi === '' ? null : Number(existingEmi),
        has_predatory_loans: hasPredatoryLoans,
        credit_status: creditStatus,
        credit_score: creditScore === '' ? null : Number(creditScore),
        missed_payments: missedPayments,
        savings_months: savingsMonths === '' ? null : Number(savingsMonths),
        owns_property: ownsProperty,
        pledge_property: pledgeProperty,
        property_value: propertyValue === '' ? null : Number(propertyValue),
      };
      setResult(runAssessment(answers));
      setStep(4);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStep(1);
  };

  const renderProgress = () => (
    <div className="mb-8 relative">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
        <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"></div>
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span className={step >= 1 ? 'text-indigo-600' : ''}>Basics</span>
        <span className={step >= 2 ? 'text-indigo-600' : ''}>Cashflow</span>
        <span className={step >= 3 ? 'text-indigo-600' : ''}>Profile</span>
        <span className={step >= 4 ? 'text-indigo-600' : ''}>Results</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">What do you need?</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">What is the loan for?</label>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-shadow">
            <option value="medical">Medical Emergency (Productive)</option>
            <option value="education">Education (Productive)</option>
            <option value="business">Business Working Capital (Productive)</option>
            <option value="vehicle_for_income">Commercial Vehicle / 2-Wheeler (Productive)</option>
            <option value="home_improvement">Home Improvement (Productive)</option>
            <option value="wedding">Wedding</option>
            <option value="gambling">Trading / Speculation (Risky)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">What loan type did you want?</label>
          <select value={loanTypeWanted} onChange={(e) => setLoanTypeWanted(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition-shadow">
            <option value="personal">Personal Loan (Unsecured)</option>
            <option value="business">Business Loan (Unsecured)</option>
            <option value="lap">Loan Against Property (Secured)</option>
            <option value="auto">Vehicle Loan (Secured)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">How much do you need? (₹)</label>
          <input type="number" value={amountWanted} onChange={(e) => setAmountWanted(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Has a lender quoted you an interest rate? (Optional %)</label>
          <input type="number" step="0.1" value={quotedRate} onChange={(e) => setQuotedRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 14.5" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
          <p className="text-xs text-slate-500 mt-1">If you enter this, we will compare it against what is fair.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tenure (Months)</label>
            <input type="number" value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Age (Optional)</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="e.g. 35" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Your Cashflow</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Income Type</label>
          <select value={incomeType} onChange={(e) => setIncomeType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
            <option value="salaried">Salaried (Payslip)</option>
            <option value="informal">Self-Employed / Informal / Gig</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your Monthly Income (₹)</label>
          <input type="number" value={declaredIncome} onChange={(e) => setDeclaredIncome(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 mb-1">Co-Applicant Monthly Income (₹, Optional)</label>
          <input type="number" value={coApplicantIncome} onChange={(e) => setCoApplicantIncome(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Leave blank if applying alone" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm mb-3" />
          {coApplicantIncome !== '' && Number(coApplicantIncome) > 0 && (
            <label className="flex items-center text-sm text-slate-700">
              <input type="checkbox" checked={coApplicantSalaried} onChange={(e) => setCoApplicantSalaried(e.target.checked)} className="mr-2 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              Is the co-applicant a salaried employee? (Preserves 100% of their income)
            </label>
          )}
        </div>

        {incomeType !== 'salaried' && (
          <div className="space-y-4 p-5 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Informal Income Assessment</h3>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">What % of your income varies month-to-month?</label>
              <input type="number" value={variableIncomePct} onChange={(e) => setVariableIncomePct(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 50" className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 shadow-sm bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Annual ITR Declared Income (₹, Optional)</label>
              <input type="number" value={itrIncome} onChange={(e) => setItrIncome(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 400000" className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 shadow-sm bg-white" />
              <p className="text-xs text-amber-700 mt-1">If blank, we widen the safety band due to missing documentation.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Household Expenses (₹)</label>
            <input type="number" value={expenses} onChange={(e) => setExpenses(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Optional" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Total EMIs (₹)</label>
            <input type="number" value={existingEmi} onChange={(e) => setExistingEmi(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Optional" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Your Profile & Assets</h2>
      
      <div className="space-y-5">
        
        {/* Predatory App Loan Check */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <label className="flex items-start">
            <input type="checkbox" checked={hasPredatoryLoans} onChange={(e) => setHasPredatoryLoans(e.target.checked)} className="mt-1 mr-3 h-5 w-5 text-red-600 rounded border-red-300 focus:ring-red-500" />
            <div className="text-sm text-red-900">
              <span className="font-semibold block">Are any of your current EMIs from high-interest instant loan apps? (25%+ APR)</span>
              Borrowing new money to pay off predatory app loans is a dangerous debt trap. Check this if true.
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Credit History Status</label>
          <select value={creditStatus} onChange={(e) => setCreditStatus(e.target.value as any)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm mb-3">
            <option value="known">I know my Credit Score</option>
            <option value="unknown">I have formal credit, but don't know my score</option>
            <option value="ntc">Never taken a formal bank loan (New To Credit)</option>
          </select>

          {creditStatus === 'known' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Credit Score</label>
              <input type="number" value={creditScore} onChange={(e) => setCreditScore(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
            </div>
          )}
        </div>

        <label className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
          <input type="checkbox" checked={missedPayments} onChange={(e) => setMissedPayments(e.target.checked)} className="mr-3 h-5 w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
          <span className="text-sm font-medium text-slate-800">Missed a loan/card payment in the last 3 months?</span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Years in current Job/Business</label>
            <input type="number" value={yearsInIncome} onChange={(e) => setYearsInIncome(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Optional" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Savings (Months)</label>
            <input type="number" value={savingsMonths} onChange={(e) => setSavingsMonths(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Optional" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm" />
          </div>
        </div>

        <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-4">
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" checked={ownsProperty} onChange={(e) => setOwnsProperty(e.target.checked)} className="mr-3 h-5 w-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500" />
            <span className="text-sm font-medium text-indigo-900">I own unencumbered property (House/Land)</span>
          </label>
          
          {ownsProperty && (
            <div className="pl-8 space-y-4 animate-in fade-in">
              <label className="flex items-start cursor-pointer">
                <input type="checkbox" checked={pledgeProperty} onChange={(e) => setPledgeProperty(e.target.checked)} className="mt-1 mr-3 h-4 w-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500" />
                <span className="text-sm text-indigo-800">
                  <span className="font-semibold block">Are you willing to pledge this property as collateral?</span>
                  This risks foreclosure if you default, but can drastically lower your interest rate.
                </span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Estimated Property Value (₹)</label>
                <input type="number" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    const isApprove = result.verdict === 'borrow' || result.verdict === 'borrow_less';

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
        
        {/* Header Verdict Card */}
        <div className={`p-8 rounded-2xl border-2 ${
          result.verdict === 'borrow' ? 'bg-emerald-50 border-emerald-500' :
          result.verdict === 'borrow_less' ? 'bg-amber-50 border-amber-500' :
          'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            {result.verdict === 'borrow' && <CheckCircle2 className="w-10 h-10 text-emerald-600" />}
            {result.verdict === 'borrow_less' && <AlertTriangle className="w-10 h-10 text-amber-600" />}
            {result.verdict === 'dont_borrow' && <AlertCircle className="w-10 h-10 text-red-600" />}
            <h2 className="text-3xl font-bold text-slate-900">
              {result.verdict === 'borrow' ? 'Safe to Borrow' :
               result.verdict === 'borrow_less' ? 'Borrow Less' :
               'Do Not Borrow'}
            </h2>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed font-medium">{result.verdict_reason}</p>
        </div>

        {isApprove && (
          <>
            {/* The Dual Ceiling Visualizer */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-lg">The "Dual Ceiling" Analysis</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6 text-sm">Banks look at what you can theoretically afford (FOIR). We look at what you can survive after expenses and stress tests. Never borrow up to the Bank limit.</p>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700">What a Bank Will Sanction</span>
                      <span className="font-bold text-slate-900">₹{result.lender_sanction_range[0].toLocaleString('en-IN')} - ₹{result.lender_sanction_range[1].toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-slate-400 h-3 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-emerald-700">What is Actually Safe For You</span>
                      <span className="font-bold text-emerald-600">₹{result.safe_carry_range[0].toLocaleString('en-IN')} - ₹{result.safe_carry_range[1].toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${Math.min(100, (result.safe_carry_range[1] / result.lender_sanction_range[1]) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Negotiation Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck className="w-32 h-32" />
              </div>
              
              <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 relative z-10">
                <Banknote className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-lg">Your Negotiation Card</h3>
              </div>
              
              <div className="p-6 relative z-10 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Target Product</p>
                    <p className="text-2xl font-bold text-white">{result.product_route}</p>
                    {result.was_rerouted && (
                      <p className="text-xs text-amber-300 mt-1">
                        (We routed you away from a {result.product_requested} loan to match what you actually qualify for based on your profile).
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Fair Interest Rate</p>
                    <p className="text-3xl font-bold text-emerald-400">{result.negotiation_card.fair_rate}</p>
                    
                    {/* NEW: Quoted Rate Comparison */}
                    {result.quoted_rate !== null && (
                      <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-sm">
                          The lender quoted you <span className="font-bold text-red-300">{result.quoted_rate}%</span>.
                          {result.quoted_rate > result.fair_rate_band[1] 
                            ? " This is higher than our fair band. You are overpaying and should negotiate." 
                            : " This is within or below our fair band. Good deal!"}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-indigo-300 mt-2">{result.negotiation_card.apr_note}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                    <p className="text-sm font-medium text-indigo-200 mb-3 uppercase tracking-wider">Ask The Lender For:</p>
                    <ul className="space-y-2">
                      {result.negotiation_card.ask.map((a, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 mr-2 shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/20">
                    <p className="text-sm font-medium text-red-300 mb-3 uppercase tracking-wider">Walk Away If:</p>
                    <ul className="space-y-2">
                      {result.negotiation_card.reject.map((r, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 mr-2 shrink-0" />
                          <span className="text-red-100">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Consequences Engine Log */}
        {result.consequences.length > 0 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-slate-800 text-lg">Copilot Engine Log</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-4 text-sm">How our engine adjusted your math based on missing information or risk factors:</p>
              <ul className="space-y-3">
                {result.consequences.map((c, i) => (
                  <li key={i} className={`flex items-start text-sm p-3 rounded-lg ${c.includes('💡 Tip') ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' : 'bg-white border border-slate-200 text-slate-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 mr-3 shrink-0 ${c.includes('💡 Tip') ? 'bg-indigo-500' : 'bg-slate-400'}`}></span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-8">
          <button onClick={handleReset} className="text-indigo-600 font-medium hover:text-indigo-700">
            Start New Assessment
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Borrower Copilot</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">We use mathematical modeling to tell you what you can safely afford, what a fair rate is, and how to negotiate.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10">
            
            {step < 4 && renderProgress()}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderResults()}

            {step < 4 && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {step === 3 ? 'Generate Assessment' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-8">
          Privacy First. Your data never leaves your browser.
        </p>
      </div>
    </div>
  );
}

export default App;
