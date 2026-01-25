/**
 * Flag Components - SVG Inline Flags
 * Simple flag representations for language selector
 */

export const FrenchFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex">
    <div className="w-1/3 bg-[#002395]" />
    <div className="w-1/3 bg-white" />
    <div className="w-1/3 bg-[#ED2939]" />
  </div>
);

export const USFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden relative">
    {/* Stripes */}
    <div className="absolute inset-0 flex flex-col">
      {[...Array(13)].map((_, i) => (
        <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#B22234]' : 'bg-white'}`} />
      ))}
    </div>
    {/* Blue canton */}
    <div className="absolute top-0 left-0 w-[45%] h-[54%] bg-[#3C3B6E]" />
  </div>
);

export const SpanishFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#AA151B]" />
    <div className="h-1/3 bg-[#F1BF00]" />
    <div className="h-1/3 bg-[#AA151B]" />
  </div>
);

export const GermanFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-black" />
    <div className="h-1/3 bg-[#DD0000]" />
    <div className="h-1/3 bg-[#FFCE00]" />
  </div>
);

export const DutchFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#AE1C28]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#21468B]" />
  </div>
);

export const RussianFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#0039A6]" />
    <div className="h-1/3 bg-[#D52B1E]" />
  </div>
);

export const ChineseFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden bg-[#DE2910] relative">
    {/* Large star */}
    <div className="absolute top-[15%] left-[8%] text-[#FFDE00] text-[8px] leading-none">★</div>
    {/* Small stars */}
    <div className="absolute top-[5%] left-[28%] text-[#FFDE00] text-[4px] leading-none">★</div>
    <div className="absolute top-[15%] left-[35%] text-[#FFDE00] text-[4px] leading-none">★</div>
    <div className="absolute top-[28%] left-[35%] text-[#FFDE00] text-[4px] leading-none">★</div>
    <div className="absolute top-[38%] left-[28%] text-[#FFDE00] text-[4px] leading-none">★</div>
  </div>
);

export const ArabicFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#006C35]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-black" />
  </div>
);

export const HindiFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#FF9933]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#138808]" />
  </div>
);

export const BengaliFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden bg-[#006A4E] flex items-center justify-center">
    <div className="w-2 h-2 rounded-full bg-[#F42A41]" />
  </div>
);

export const TurkishFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden bg-[#E30A17] relative flex items-center">
    {/* Crescent - outer circle */}
    <div className="absolute left-[20%] w-2 h-2 rounded-full bg-white" />
    {/* Crescent - inner circle (mask) */}
    <div className="absolute left-[25%] w-1.5 h-1.5 rounded-full bg-[#E30A17]" />
    {/* Star */}
    <div className="absolute left-[45%] text-white text-[6px] leading-none">★</div>
  </div>
);

export const UrduFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex">
    {/* White stripe */}
    <div className="w-1/4 bg-white" />
    {/* Green field with crescent and star */}
    <div className="w-3/4 bg-[#01411C] relative flex items-center justify-center">
      {/* Crescent - outer circle */}
      <div className="absolute w-2 h-2 rounded-full bg-white" style={{ left: '25%' }} />
      {/* Crescent - inner circle (mask) */}
      <div className="absolute w-1.5 h-1.5 rounded-full bg-[#01411C]" style={{ left: '30%' }} />
      {/* Star */}
      <div className="absolute text-white text-[5px] leading-none" style={{ left: '55%' }}>★</div>
    </div>
  </div>
);

export const LuxembourgishFlag = () => (
  <div className="w-6 h-4 rounded overflow-hidden flex flex-col">
    <div className="h-1/3 bg-[#ED2939]" />
    <div className="h-1/3 bg-white" />
    <div className="h-1/3 bg-[#00A1DE]" />
  </div>
);
