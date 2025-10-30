import React, { useState } from 'react';
import { createOutgoingCorrespondence, createIncomingTask } from '../services/api';

interface CreateCorrespondenceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const KARTOTEKA_OPTIONS = [
    "Markaziy Bank",
    "Murojaatlar",
    "Prezident Administratsiyasi",
    "Vazirlar Mahkamasi",
    "Xizmat yozishmalari",
    "Nazoratdagi",
];

const CreateCorrespondenceModal: React.FC<CreateCorrespondenceModalProps> = ({ onClose, onSuccess }) => {
  const [type, setType] = useState<'Kiruvchi' | 'Chiquvchi'>('Chiquvchi');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [kartoteka, setKartoteka] = useState(KARTOTEKA_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Дополнительные поля для Murojaatlar
  const [qaydRaqam, setQaydRaqam] = useState('');
  const [qaydSana, setQaydSana] = useState('');
  const [chiqishRaqam, setChiqishRaqam] = useState('');
  const [chiqishSana, setChiqishSana] = useState('');
  const [hujjatTuri, setHujjatTuri] = useState('');
  const [yetkazishTuri, setYetkazishTuri] = useState('');
  const [murojaatJamoaviyligi, setMurojaatJamoaviyligi] = useState('');
  const [murojaatTuri, setMurojaatTuri] = useState('');
  const [murojaatShakli, setMurojaatShakli] = useState('');
  const [tashkilot, setTashkilot] = useState('');
  const [manzil, setManzil] = useState('');
  const [sohasi, setSohasi] = useState('');
  const [tarmoqYonalishi, setTarmoqYonalishi] = useState('');
  const [holati, setHolati] = useState('');
  const [murojaatchiTuri, setMurojaatchiTuri] = useState('');
  const [stirYokiJshshir, setStirYokiJshshir] = useState('');
  const [muallif, setMuallif] = useState('');
  const [tugulganSana, setTugulganSana] = useState('');
  const [jinsi, setJinsi] = useState('');
  const [telefonRaqami, setTelefonRaqami] = useState('');
  const [viloyatlar, setViloyatlar] = useState('');
  const [tuman, setTuman] = useState('');
  const [mahallaNomi, setMahallaNomi] = useState('');
  const [sektor, setSektor] = useState('');
  const [mazmuni, setMazmuni] = useState('');
  const [biriktirilganFayllar, setBiriktirilganFayllar] = useState('');
  const [normativHujjatRaqami, setNormativHujjatRaqami] = useState('');
  const [kartochkaOchish, setKartochkaOchish] = useState('');

  const isMurojaatlar = kartoteka === 'Murojaatlar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (type === 'Chiquvchi') {
        await createOutgoingCorrespondence({ title, content, kartoteka });
      } else {
        await createIncomingTask(title, content, kartoteka, kartoteka);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Hujjatni yaratishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 pb-16" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col text-white bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/20">
          <h2 className="text-2xl font-bold">Yangi Hujjat Yaratish</h2>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Hujjat Turi */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white/80">Hujjat Turi</label>
            <div className="flex items-center gap-6 p-3 bg-white/10 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer flex-1 justify-center">
                <input
                  type="radio"
                  name="type"
                  value="Chiquvchi"
                  checked={type === 'Chiquvchi'}
                  onChange={() => setType('Chiquvchi')}
                  className="w-4 h-4 text-cyan-500"
                />
                <span className="text-base">Chiquvchi</span>
              </label>
              <div className="h-6 w-px bg-white/20"></div>
              <label className="flex items-center gap-2 cursor-pointer flex-1 justify-center">
                <input
                  type="radio"
                  name="type"
                  value="Kiruvchi"
                  checked={type === 'Kiruvchi'}
                  onChange={() => setType('Kiruvchi')}
                  className="w-4 h-4 text-cyan-500"
                />
                <span className="text-base">Kiruvchi</span>
              </label>
            </div>
          </div>

          {/* Sarlavha */}
          <div>
            <label htmlFor="title" className="block mb-2 text-sm font-medium text-white/80">
              Sarlavha
            </label>
            <input 
              type="text" 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
            />
          </div>

          {/* Kartoteka */}
          <div>
            <label htmlFor="kartoteka" className="block mb-2 text-sm font-medium text-white/80">
              Kartoteka
            </label>
            <select
              id="kartoteka"
              value={kartoteka}
              onChange={(e) => setKartoteka(e.target.value)}
              required
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {KARTOTEKA_OPTIONS.map(item => (
                <option key={item} value={item} className="bg-gray-900 text-white">{item}</option>
              ))}
            </select>
          </div>

          {/* Matn */}
          <div>
            <label htmlFor="content" className="block mb-2 text-sm font-medium text-white/80">
              Matn
            </label>
            <textarea 
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required 
              rows={6} // <-- ИЗМЕНЕНИЕ ЗДЕСЬ (было 10)
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Дополнительные поля для Murojaatlar */}
          {isMurojaatlar && (
            <div className="space-y-4 pt-4 border-t border-white/20">
              <h3 className="text-lg font-semibold text-cyan-400">Qo'shimcha ma'lumotlar</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-white/80">Qayd raqam</label>
                  <input type="text" value={qaydRaqam} onChange={(e) => setQaydRaqam(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Qayd sana</label>
                  <input type="date" value={qaydSana} onChange={(e) => setQaydSana(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Chiqish raqam</label>
                  <input type="text" value={chiqishRaqam} onChange={(e) => setChiqishRaqam(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Chiqish sana</label>
                  <input type="date" value={chiqishSana} onChange={(e) => setChiqishSana(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Hujjat turi</label>
                  <input type="text" value={hujjatTuri} onChange={(e) => setHujjatTuri(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Yetkazish turi</label>
                  <input type="text" value={yetkazishTuri} onChange={(e) => setYetkazishTuri(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Murojaatning jamoaviyligi</label>
                  <input type="text" value={murojaatJamoaviyligi} onChange={(e) => setMurojaatJamoaviyligi(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Murojaat turi</label>
                  <input type="text" value={murojaatTuri} onChange={(e) => setMurojaatTuri(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Murojaat shakli</label>
                  <input type="text" value={murojaatShakli} onChange={(e) => setMurojaatShakli(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Tashkilot</label>
                  <input type="text" value={tashkilot} onChange={(e) => setTashkilot(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Manzil</label>
                  <input type="text" value={manzil} onChange={(e) => setManzil(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Sohasi</label>
                  <input type="text" value={sohasi} onChange={(e) => setSohasi(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Tarmoq yo'nalishi</label>
                  <input type="text" value={tarmoqYonalishi} onChange={(e) => setTarmoqYonalishi(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Holati</label>
                  <input type="text" value={holati} onChange={(e) => setHolati(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Murojaatchi turi</label>
                  <input type="text" value={murojaatchiTuri} onChange={(e) => setMurojaatchiTuri(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">STIR yoki JSHSHIR</label>
                  <input type="text" value={stirYokiJshshir} onChange={(e) => setStirYokiJshshir(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Muallif</label>
                  <input type="text" value={muallif} onChange={(e) => setMuallif(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Tug'ilgan sana</label>
                  <input type="date" value={tugulganSana} onChange={(e) => setTugulganSana(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Jinsi</label>
                  <select value={jinsi} onChange={(e) => setJinsi(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500">
                    <option value="" className="bg-gray-900">Tanlang</option>
                    <option value="Erkak" className="bg-gray-900">Erkak</option>
                    <option value="Ayol" className="bg-gray-900">Ayol</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Telefon raqami</label>
                  <input type="tel" value={telefonRaqami} onChange={(e) => setTelefonRaqami(e.target.value)} placeholder="+998 XX XXX XX XX" className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Viloyat</label>
                  <input type="text" value={viloyatlar} onChange={(e) => setViloyatlar(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Tuman</label>
                  <input type="text" value={tuman} onChange={(e) => setTuman(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Mahalla nomi</label>
                  <input type="text" value={mahallaNomi} onChange={(e) => setMahallaNomi(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Sektor</label>
                  <input type="text" value={sektor} onChange={(e) => setSektor(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Biriktirilgan fayllar</label>
                  <input type="text" value={biriktirilganFayllar} onChange={(e) => setBiriktirilganFayllar(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Normativ hujjat raqami</label>
                  <input type="text" value={normativHujjatRaqami} onChange={(e) => setNormativHujjatRaqami(e.target.value)} className="w-full p-2 bg-white/1IAm/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">Kartochka ochish</label>
                  <input type="date" value={kartochkaOchish} onChange={(e) => setKartochkaOchish(e.target.value)} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm text-white/80">Mazmuni</label>
                <textarea value={mazmuni} onChange={(e) => setMazmuni(e.target.value)} rows={4} className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 resize-none" />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </form>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-white/20 bg-black/30">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium"
          >
            Bekor qilish
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading} 
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all shadow-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Yaratilmoqda...' : 'Yaratish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCorrespondenceModal;