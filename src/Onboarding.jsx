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
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow-lg" style={{ borderRadius: '20px', border: 'none' }}>
        <div className="card-header text-center" style={{ background: 'linear-gradient(135deg, #1e3c72, #2a5298)', color: 'white', borderRadius: '20px 20px 0 0', padding: '20px' }}>
          <h4 className="fw-bold mb-0">🚀 KHỞI TẠO TRỢ LÝ CÁ NHÂN</h4>
        </div>
        <div className="card-body p-4">
          
          {step === 1 && (
            <div>
              <h5 className="fw-bold mb-3 text-primary">Bước 1: Thông tin Gia đình</h5>
              <p className="text-muted small">Thông tin này giúp Cố vấn AI nhận diện và gọi đúng tên gia đình bạn. Số điện thoại được dùng làm mã khóa an toàn để bạn quay lại xem dữ liệu sau này.</p>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Điện thoại của Bố/Mẹ (Dùng làm Mật khẩu):</label>
                <input type="text" className="form-control" placeholder="VD: 0912345678" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Tên của Bố/Mẹ (Để xưng hô):</label>
                <input type="text" className="form-control" placeholder="VD: Mẹ Hương, Bố Tuấn" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Tên ở nhà/Tên thật của Sĩ tử:</label>
                <input type="text" className="form-control" placeholder="VD: Bé Cua, Tít, Trí" value={formData.childName} onChange={e => setFormData({...formData, childName: e.target.value})} />
              </div>
              <button className="btn btn-primary w-100 fw-bold mt-3" style={{ padding: '12px', borderRadius: '12px' }} onClick={nextStep}>TIẾP TỤC ➡️</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h5 className="fw-bold mb-3 text-danger">Bước 2: Cấp năng lượng (API Key) cho AI</h5>
              <div className="alert alert-warning p-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                <strong>TẠI SAO CẦN BƯỚC NÀY?</strong><br/>
                Để AI tư vấn riêng tư và thông minh nhất cho <strong>{formData.childName || "con"}</strong>, mỗi gia đình cần một "Túi năng lượng" (API Key) hoàn toàn miễn phí từ Google. <br/><br/>
                <strong>🔑 HƯỚNG DẪN CẦM TAY CHỈ VIỆC (Mất 1 phút):</strong>
                <ol className="mb-0 mt-2 p-0 ps-3">
                  <li className="mb-2">Bấm vào đường link này (Nên mở thẻ mới): <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="fw-bold text-primary">Google AI Studio</a></li>
                  <li className="mb-2">Đăng nhập bằng tài khoản Gmail của bạn.</li>
                  <li className="mb-2">Bấm nút màu xanh <strong>"Create API Key"</strong>.</li>
                  <li className="mb-2">Chọn dòng đầu tiên <strong>"Create API key in new project"</strong>. Cứ chờ nó chạy 1 tí.</li>
                  <li className="mb-2">Nó sẽ hiện ra một chuỗi chữ và số rất dài. Bấm chữ <strong>"Copy"</strong>.</li>
                  <li>Quay lại trang này và <strong>Dán (Paste)</strong> vào ô bên dưới.</li>
                </ol>
              </div>
              
              <div className="mb-3 mt-4">
                <label className="form-label fw-bold">Dán mã API Key của bạn vào đây:</label>
                <input type="text" className="form-control border-primary" placeholder="AIzaSy..." value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
              </div>
              
              <div className="d-flex gap-2">
                <button className="btn btn-secondary fw-bold" style={{ padding: '12px', borderRadius: '12px', flex: '1' }} onClick={() => setStep(1)}>⬅️ QUAY LẠI</button>
                <button className="btn btn-success fw-bold" style={{ padding: '12px', borderRadius: '12px', flex: '2' }} onClick={finish}>✅ HOÀN TẤT & VÀO APP</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
