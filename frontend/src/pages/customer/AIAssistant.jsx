import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCheck, FiCpu, FiTrendingUp, FiUploadCloud, FiSmile, FiArrowRight } from 'react-icons/fi';

const FACE_SHAPES = [
  { value: 'oval', label: 'Oval', icon: '🥚', description: 'Width is about 1/2 of length. Jaw is rounded.' },
  { value: 'round', label: 'Round', icon: '⭕', description: 'Equal length and width. Cheeks are full and round.' },
  { value: 'square', label: 'Square', icon: '⬜', description: 'Jaw, forehead, and cheekbones are of equal width.' },
  { value: 'heart', label: 'Heart', icon: '❤️', description: 'Forehead is wider than jaw. Chin is narrow/pointed.' },
  { value: 'diamond', label: 'Diamond', icon: '💎', description: 'Cheekbones are wide. Chin and forehead are narrow.' },
];

const RECOMMENDATIONS = {
  oval: {
    title: 'Oval Face Shape Recommendations',
    description: 'Oval faces are highly symmetrical and versatile. Most hair lengths and textures look fantastic on you!',
    styles: [
      { name: 'Classic Haircut', suitability: 'Accentuates natural facial balance and clean look.' },
      { name: 'Fade Haircut', suitability: 'Short sides draw focus to the eyes and cheekbones.' },
      { name: 'Haircut + Beard Combo', suitability: 'Perfect for adding jaw definition.' }
    ]
  },
  round: {
    title: 'Round Face Shape Recommendations',
    description: 'Adding volume on top and keeping the sides short helps to elongate your face and create clean structure.',
    styles: [
      { name: 'Fade Haircut', suitability: 'Skins-fade on sides draws visual height to the crown.' },
      { name: 'Classic Haircut', suitability: 'Ask for shorter sides with a textured quiff or comb-over.' },
      { name: 'Scalp Treatment', suitability: 'Promotes healthy follicles to build full volume on top.' }
    ]
  },
  square: {
    title: 'Square Face Shape Recommendations',
    description: 'Strong, masculine jawlines match best with sharp, short haircuts or neat side-partings.',
    styles: [
      { name: 'Classic Haircut', suitability: 'Neat side parts or crew cuts look exceptionally clean.' },
      { name: 'Beard Trim', suitability: 'A well-sculpted beard highlights the strong jawline.' },
      { name: 'Kids Haircut', suitability: 'Neat crop looks timeless and clean.' }
    ]
  },
  heart: {
    title: 'Heart Face Shape Recommendations',
    description: 'Mid-length haircuts or adding a beard helps balance out a wider forehead and a pointed chin.',
    styles: [
      { name: 'Haircut + Beard Combo', suitability: 'Beard adds width to the narrow chin, creating total balance.' },
      { name: 'Hair Coloring', suitability: 'Textured fringe styling helps balance the forehead width.' },
      { name: 'Scalp Treatment', suitability: 'Great for nourishing longer styles.' }
    ]
  },
  diamond: {
    title: 'Diamond Face Shape Recommendations',
    description: 'Softer fringes or textured layers help reduce cheekbone sharpness and balance your forehead.',
    styles: [
      { name: 'Classic Haircut', suitability: 'Ask for a messy fringe or side-swept quiff.' },
      { name: 'Hot Towel Shave', suitability: 'Smooth shave highlights your sharp, sculpted bone structure.' },
      { name: 'Hair Coloring', suitability: 'Highlights can soften high-contrast facial angles.' }
    ]
  }
};

const TRENDING = [
  { name: 'Bollywood Slick Pompadour', description: 'Virat Kohli style fade with an extended slick top.', tags: ['Popular', 'Bold'] },
  { name: 'Textured Crop + Skin Fade', description: 'Low maintenance crop with sharp skin blending.', tags: ['Clean', 'Modern'] },
  { name: 'Mid Fade + Trimmed Beard', description: 'Seamlessly connects temple fade with sideburns.', tags: ['Sharp', 'Classic'] },
];

const AIAssistant = () => {
  const navigate = useNavigate();
  const [selectedShape, setSelectedShape] = useState('');
  const [scanning, setScanning] = useState(false);
  const [services, setServices] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Load services to match ID when booking
  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.data));
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedImage(URL.createObjectURL(file));
    setScanning(true);
    setSelectedShape('');

    // Simulate AI Scan
    setTimeout(() => {
      setScanning(false);
      // Pick a random face shape for simulation
      const shapes = ['oval', 'round', 'square', 'heart', 'diamond'];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      setSelectedShape(randomShape);
      toast.success(`AI Scan Complete: Detected ${randomShape.charAt(0).toUpperCase() + randomShape.slice(1)} face shape! 🔬`);
    }, 2800);
  };

  const handleBookService = (serviceName) => {
    const matchedService = services.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
    if (matchedService) {
      navigate(`/customer/book?service=${matchedService._id}`);
    } else {
      navigate('/customer/book');
    }
  };

  return (
    <div className="dashboard-wrapper font-outfit">
      <Navbar />
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          box-shadow: 0 0 10px #D4AF37;
          animation: scan 2s linear infinite;
        }
      `}</style>

      <div className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-10 animate-in">
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
              <FiCpu className="text-gold-500" /> AI Style Recommender
            </h1>
            <p className="text-gray-400">Upload a selfie or pick your face shape manually to find the perfect haircut</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: AI Scanner / Face Shape Picker */}
            <div className="lg:col-span-1 space-y-6">
              {/* Photo Upload area */}
              <div className="glass-card p-6 border-gold-500/20 text-center relative overflow-hidden flex flex-col justify-center min-h-[260px]">
                {scanning ? (
                  <div className="space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-2xl bg-white/5 border border-gold-500/30 relative overflow-hidden">
                      {uploadedImage && <img src={uploadedImage} alt="Scanning" className="w-full h-full object-cover opacity-60" />}
                      <div className="scan-line" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">AI Scanning Face...</p>
                      <p className="text-gray-500 text-xs mt-1">Analyzing alignment and structure</p>
                    </div>
                  </div>
                ) : uploadedImage ? (
                  <div className="space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-gold-500/40 relative">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                    <label className="text-xs text-gold-500 cursor-pointer hover:underline">
                      Upload different photo
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer group space-y-3">
                    <div className="w-14 h-14 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto text-gold-500 transition-all group-hover:scale-110">
                      <FiUploadCloud size={24} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Upload Face Photo</p>
                      <p className="text-gray-500 text-xs mt-1 px-4">Drag/click to scan face geometry automatically</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Manual Selection */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <FiSmile size={16} className="text-gold-500" /> Manual Select Shape
                </h3>
                <div className="flex flex-col gap-2">
                  {FACE_SHAPES.map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => { setSelectedShape(shape.value); setUploadedImage(null); }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        selectedShape === shape.value
                          ? 'border-gold-500/50 bg-gold-500/10'
                          : 'border-white/5 bg-white/3 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{shape.icon}</span>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-xs capitalize">{shape.label}</p>
                        <p className="text-gray-500 text-[10px] truncate mt-0.5">{shape.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Analysis Results & Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              {selectedShape ? (
                <div className="glass-card p-6 border-gold-500/20 relative overflow-hidden animate-in">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
                  
                  {/* Analysis Summary */}
                  <div className="mb-6">
                    <span className="text-xs text-gold-500 font-bold uppercase tracking-wider">AI Recommendation Result</span>
                    <h2 className="text-white text-2xl font-black mt-1 capitalize">
                      {selectedShape} Face Shape
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                      {RECOMMENDATIONS[selectedShape].description}
                    </p>
                  </div>

                  {/* List of matches */}
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm">Suggested Haircuts & Grooming:</h3>
                    {RECOMMENDATIONS[selectedShape].styles.map((style) => (
                      <div key={style.name} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 transition-all gap-4">
                        <div>
                          <p className="text-white font-bold text-sm">{style.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{style.suitability}</p>
                        </div>
                        <button
                          onClick={() => handleBookService(style.name)}
                          className="btn-gold text-xs py-2.5 px-4 shrink-0"
                        >
                          Book Style <FiArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center text-gray-500 min-h-[350px] flex flex-col justify-center">
                  <div className="w-16 h-16 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mx-auto text-2xl mb-4">
                    🤖
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Awaiting Face Input</h3>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto">
                    Please upload a photo of your face or select a face shape category manually to view customized recommendations.
                  </p>
                </div>
              )}

              {/* Trending in India Section */}
              <div className="glass-card p-6 space-y-6">
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <FiTrendingUp className="text-gold-500" /> Trending in Indian Salons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TRENDING.map((trend) => (
                    <div key={trend.name} className="p-4 rounded-xl bg-white/3 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex gap-1.5">
                          {trend.tags.map((t) => (
                            <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold-500/15 text-gold-500 uppercase">
                              {t}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-white font-bold text-sm">{trend.name}</h4>
                        <p className="text-gray-400 text-xs leading-normal">{trend.description}</p>
                      </div>
                      <button
                        onClick={() => navigate('/customer/book')}
                        className="text-xs text-gold-500 hover:text-gold-400 mt-4 text-left font-bold flex items-center gap-1"
                      >
                        Book Slot <FiArrowRight size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
