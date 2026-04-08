import React, { useState } from 'react';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ phone: '', parentName: '', childName: '', apiKey: '' });

  const nextStep = () => {
    if (step === 1 && (!formData.phone || !formData.parentName || !formData.childName)) {
      alert("Vui lòng điền đủ thông tin để Cố vấn AI phục vụ tốt nhất!");
      return;
    }
    setStep(2);
  };

  const finish = () => {
    if (!formData.apiKey || formData.apiKey.length < 20) {
      alert("API Key không hợp lệ. Vui lòng làm đúng hướng dẫn!");
      return;
    }
    localStorage.setItem('vao10_phone', formData.phone);
    localStorage.setItem('vao10_parent', formData.parentName);
    localStorage.setItem('vao10_child', formData.childName);
    localStorage.setItem('vao10_apikey', formData.apiKey);
    onComplete();
  };

  return (
    <div className="container mt-5 fade-in" style={{ maxWidth: '550px' }}>
      <div className="glass-panel overflow-hidden border-0">
        <div className="gradient-header text-center py-4 px-3">
          <h4 className="mb-1">🚀 KHỞI TẠO TRỢ LÝ</h4>
          <p className="mb-0 opacity-75 small fw-medium">Cá nhân hóa trải nghiệm cho gia đình bạn</p>
        </div>
        
        <div className="p-4 pt-5">
          {step === 1 && (
            <div className="fade-in">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px', flexShrink: 0, fontWeight: 800 }}>1</div>
                <h5 className="mb-0">Thông tin Gia đình</h5>
              </div>
              
              <p className="text-muted small mb-4">Thông tin này giúp Cố vấn AI nhận diện và xưng hô đúng với gia đình. Số điện thoại được dùng làm mã khóa bảo mật.</p>
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-75">Số điện thoại (Mật khẩu)</label>
                <input 
                  type="text" className="form-control form-input-modern" 
                  placeholder="VD: 0912345678" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-75">Tên Bố/Mẹ (Để xưng hô)</label>
                <input 
                  type="text" className="form-control form-input-modern" 
                  placeholder="VD: Mẹ Hương, Bố Tuấn" 
                  value={formData.parentName} 
                  onChange={e => setFormData({...formData, parentName: e.target.value})} 
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-75">Tên Sĩ tử (Ở nhà/Thật)</label>
                <input 
                  type="text" className="form-control form-input-modern" 
                  placeholder="VD: Bé Cua, Tít, Trí" 
                  value={formData.childName} 
                  onChange={e => setFormData({...formData, childName: e.target.value})} 
                />
              </div>
              
              <button className="btn-modern btn-primary w-100 mt-2 py-3" onClick={nextStep}>
                TIẾP TỤC BƯỚC 2 <span style={{ marginLeft: '8px' }}>→</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px', flexShrink: 0, fontWeight: 800 }}>2</div>
                <h5 className="mb-0">Kích hoạt Năng lượng AI</h5>
              </div>

              <div className="p-3 rounded-4 mb-4" style={{ background: 'rgba(255, 193, 7, 0.1)', borderLeft: '4px solid #ffc107' }}>
                <p className="small mb-1 text-dark"><strong>Tại sao cần bước này?</strong></p>
                <p className="small mb-0 text-muted" style={{ lineHeight: 1.5 }}>Để AI tư vấn riêng tư nhất cho <strong>{formData.childName || "con"}</strong>, mỗi gia đình cần một "Túi năng lượng" (API Key) miễn phí từ Google.</p>
              </div>

              <div className="mb-4">
                <div className="small fw-bold text-uppercase opacity-75 mb-2">Hướng dẫn nhanh (1 phút):</div>
                <div className="bg-light p-3 rounded-4 small border">
                  <ol className="mb-0 ps-3">
                    <li className="mb-2">Mở: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="fw-bold text-primary text-decoration-none">Google AI Studio ↗</a></li>
                    <li className="mb-2">Bấm <strong>"Create API Key"</strong> & chờ giây lát.</li>
                    <li><strong>Copy</strong> mã chuỗi dài và <strong>Dán</strong> vào ô dưới.</li>
                  </ol>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-75">Dán mã API Key tại đây</label>
                <input 
                  type="text" className="form-control form-input-modern border-primary shadow-sm" 
                  placeholder="AIzaSy..." 
                  value={formData.apiKey} 
                  onChange={e => setFormData({...formData, apiKey: e.target.value})} 
                />
              </div>
              
              <div className="d-flex gap-3">
                <button className="btn-modern btn-light border flex-grow-1" onClick={() => setStep(1)}>
                  QUAY LẠI
                </button>
                <button className="btn-modern btn-success flex-grow-[2]" onClick={finish}>
                  BẮT ĐẦU NGAY ✨
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  );
}
