import React, { useState, useEffect, useRef } from 'react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2s0X7qsvCjjkSJlJD5uq9ukzvS_IzRz97JRYyvtPdI5Z9iu15YvBlSTxIZliAf9rrvA/exec";

export default function MainApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    nv1: '', nv2: '', nv3: '',
    thunghiem: false, vneid2: false, cccd: false, khaisinh: false, hocba: false,
    anhthe: false, minhchung: false, uutien: false, giaytntam: false, phieudutuyen: false,
    lephi: false, xacnhan: false,
    sdtPhuHuynh: '', maHocSinh: '', passSoGD: '', diemT3: '', diemT4: ''
  });
  
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  
  const chatEndRef = useRef(null);

  const phone = localStorage.getItem('vao10_phone') || '';
  const apiKey = localStorage.getItem('vao10_apikey') || '';
  const parentName = localStorage.getItem('vao10_parent') || '';
  const childName = localStorage.getItem('vao10_child') || '';

  // Khôi phục SĐT vào form data
  useEffect(() => {
    setData(prev => ({...prev, sdtPhuHuynh: phone}));
  }, [phone]);

  useEffect(() => {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getInitialData", phone, fatherName: parentName, childName })
    }).then(res => res.json()).then(res => {
      if (res.data) setData(prev => ({...prev, ...res.data}));
      if (res.chatHistory) setChatHistory(res.chatHistory.map(c => ({ user: parentName, question: c.question, answer: c.answer })));
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [phone, childName, parentName]);

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleChange = (field, value) => {
    setData(prev => ({...prev, [field]: value}));
  };

  const saveData = () => {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "saveData", phone, data })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) showAlert("✅ LƯU THÀNH CÔNG!");
      else showAlert("⚠️ CHƯA LƯU ĐƯỢC: " + res.error);
    }).catch(err => showAlert("Lỗi kết nối!"));
  };

  const handleCopyDraft = () => {
    const text = `📝 TỜ NHÁP ĐIỆN TỬ -
============================
1. THÔNG TIN HỌC SINH
- Mã Học Sinh: ${data.maHocSinh || "(Chưa nhập)"}
- Điện Thoại PH: ${data.sdtPhuHuynh || "(Chưa nhập)"}

2. CHIẾN LƯỢC NGUYỆN VỌNG
- NV1: ${data.nv1 || "(Chưa chốt)"}
- NV2: ${data.nv2 || "(Chưa chốt)"}
- NV3: ${data.nv3 || "(Chưa chốt)"}
============================
(Tuyệt đối không đổi phút chót!)`;
    navigator.clipboard.writeText(text).then(() => {
      showAlert("✅ Đã copy Tờ nháp thành công!");
      setShowModal(false);
    });
  };

  const sendToAI = async () => {
    if (!question.trim()) return;
    const currentQ = question;
    const newChat = [...chatHistory, { user: parentName, question: currentQ, answer: null }];
    setChatHistory(newChat);
    setQuestion("");
    setAiThinking(true);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "askAI", phone, question: currentQ,
          chatContext: chatHistory.map(c => `Phụ huynh: ${c.question}\nAI: ${c.answer}`).join("\n"),
          apiKey, names: { parentName, childName, nv1: data.nv1, nv2: data.nv2, nv3: data.nv3 }
        })
      });
      const resJSON = await response.json();
      const updatedChat = [...newChat];
      updatedChat[updatedChat.length - 1].answer = resJSON.answer || "Lỗi AI.";
      setChatHistory(updatedChat);
    } catch(err) {
      showAlert("Lỗi khi kết nối AI!");
    }
    setAiThinking(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, aiThinking, activeTab]);

  if (isLoading) return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
      <p className="text-muted fw-medium">Đang tải dữ liệu...</p>
    </div>
  );

  return (
    <div className="container-fluid p-0 fade-in" style={{ maxWidth: '600px', margin: 'auto', paddingBottom: '100px' }}>
      
      {/* HEADER SECTION */}
      <div className="gradient-header p-4 pb-5 rounded-bottom-5 shadow-lg mb-n4 position-relative z-1 text-center">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="text-start">
            <h3 className="fw-bold mb-0 text-white">🚀 CÙNG CON VÀO 10</h3>
            <p className="opacity-75 small fw-medium mb-0">Tối ưu quyết định • Chắc suất trường ngon!</p>
          </div>
          <button 
            className="btn btn-sm btn-light rounded-pill px-3 fw-bold opacity-90 border-0" 
            onClick={onLogout}
            style={{ fontSize: '0.75rem' }}
          >
            ĐĂNG XUẤT
          </button>
        </div>
        <div className="bg-white bg-opacity-10 rounded-4 p-2 d-inline-block border border-white border-opacity-10 px-3">
          <span className="small text-white">📱 {phone}</span>
        </div>
      </div>

      {/* NAV TABS - FLOATING BAR */}
      <div className="px-3 position-relative z-2" style={{ marginTop: '-25px' }}>
        <div className="glass-panel p-1 d-flex gap-1 bg-white bg-opacity-80 backdrop-blur">
          {[
            { id: 'dashboard', label: '🎯 Chiến Lược' },
            { id: 'account', label: '🔐 Hồ Sơ' },
            { id: 'ai', label: '✨ AI Live' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn-modern flex-fill border-0 ${activeTab === tab.id ? 'btn-primary shadow-sm' : 'btn-light bg-transparent text-muted'}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: '10px 4px', fontSize: '0.9rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* COMPONENT CONTENT */}
      <div className="px-3 mt-4">
        
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="glass-panel p-4 mb-4 border-0">
              <h5 className="fw-bold text-primary mb-4 d-flex align-items-center">
                <span className="me-2 text-danger">●</span> 1. Chốt Nguyện Vọng
              </h5>
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-60">NV 1 (Mơ ước)</label>
                <input 
                  list="danhSachTruong" className="form-control form-input-modern text-danger fw-bold border-danger border-opacity-25" 
                  value={data.nv1} onChange={e => handleChange('nv1', e.target.value)} 
                  placeholder="Chọn trường NV1..." 
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-60">NV 2 (An toàn)</label>
                <input 
                  list="danhSachTruong" className="form-control form-input-modern text-warning fw-bold border-warning border-opacity-25" 
                  value={data.nv2} onChange={e => handleChange('nv2', e.target.value)} 
                  placeholder="Chọn trường NV2..." 
                />
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-uppercase opacity-60">NV 3 (Chắc chắn)</label>
                <input 
                  list="danhSachTruong" className="form-control form-input-modern text-success fw-bold border-success border-opacity-25" 
                  value={data.nv3} onChange={e => handleChange('nv3', e.target.value)} 
                  placeholder="Chọn trường NV3..." 
                />
              </div>
            </div>

            <div className="glass-panel p-4 mb-4 border-0">
              <h5 className="fw-bold text-primary mb-4 d-flex align-items-center">
                <span className="me-2 text-success">●</span> 2. Checklist Hồ Sơ
              </h5>
              <div className="row g-3">
                {[
                  { id: 'vneid2', label: 'Tài khoản VNeID Mức 2' },
                  { id: 'cccd', label: 'Bản chụp CCCD (2 mặt)' },
                  { id: 'khaisinh', label: 'Bản chụp Giấy khai sinh' },
                  { id: 'hocba', label: 'Bản chụp Học bạ THCS' },
                  { id: 'anhthe', label: 'Ảnh thẻ 4x6 và 3x4' },
                  { id: 'minhchung', label: 'Minh chứng cư trú' },
                ].map(item => (
                  <div className="col-12" key={item.id}>
                    <div className="form-check p-3 rounded-3 border bg-light d-flex align-items-center m-0">
                      <input 
                        className="form-check-input ms-0 me-3" type="checkbox" id={item.id} 
                        checked={data[item.id]} onChange={e => handleChange(item.id, e.target.checked)} 
                        style={{ width: '20px', height: '20px' }}
                      />
                      <label className="form-check-label fw-medium stretched-link" htmlFor={item.id}>{item.label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
              <button 
                className="btn-modern btn-warning py-3 shadow-sm border-0 w-100" 
                onClick={() => setShowModal(true)}
              >
                📝 XEM & COPY TỜ NHÁP
              </button>
              <button 
                className="btn-modern btn-primary py-3 shadow-lg border-0 w-100" 
                style={{ background: 'var(--primary)' }}
                onClick={saveData}
              >
                💾 LƯU BẢNG CHỐT CHIẾN LƯỢC
              </button>
            </div>
          </div>
        )}

        {/* TAB: ACCOUNT */}
        {activeTab === 'account' && (
          <div className="fade-in">
            <div className="glass-panel p-4 mb-4 border-0">
              <h5 className="fw-bold text-primary mb-4">🔑 Tài Khoản Của Sở</h5>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-60">Điện thoại Bố/Mẹ</label>
                <input type="text" className="form-control form-input-modern bg-light border-0" value={data.sdtPhuHuynh} disabled />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase opacity-60">Mã Học Sinh</label>
                <input 
                  type="text" className="form-control form-input-modern fw-bold text-primary" 
                  value={data.maHocSinh} onChange={e => handleChange('maHocSinh', e.target.value)} 
                  placeholder="01234..." 
                />
              </div>
              <div className="mb-0">
                <label className="form-label small fw-bold text-uppercase opacity-60">Mật khẩu mới (Cổng Sở)</label>
                <input 
                  type="password" className="form-control form-input-modern" 
                  value={data.passSoGD} onChange={e => handleChange('passSoGD', e.target.value)} 
                  placeholder="••••••" 
                />
              </div>
            </div>

            <div className="glass-panel p-4 mb-4 border-0">
              <h5 className="fw-bold text-primary mb-4">📈 Điểm Thi Thử</h5>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-uppercase opacity-60">Tháng 3</label>
                  <input 
                    type="number" step="0.25" className="form-control form-input-modern text-center fs-5 fw-bold" 
                    value={data.diemT3} onChange={e => handleChange('diemT3', e.target.value)} 
                    placeholder="VD: 39" 
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-uppercase opacity-60">Tháng 4</label>
                  <input 
                    type="number" step="0.25" className="form-control form-input-modern text-center fs-5 fw-bold" 
                    value={data.diemT4} onChange={e => handleChange('diemT4', e.target.value)} 
                    placeholder="VD: 41" 
                  />
                </div>
              </div>
            </div>
            
            <button 
              className="btn-modern btn-primary py-3 shadow-lg border-0 w-100 mb-4" 
              style={{ background: 'var(--primary)' }}
              onClick={saveData}
            >
              💾 LƯU THÔNG TIN HỒ SƠ
            </button>
          </div>
        )}

        {/* TAB: AI ADVISOR */}
        {activeTab === 'ai' && (
          <div className="fade-in glass-panel overflow-hidden d-flex flex-column border-0" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
            <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0">Cố vấn AI (Live)</h6>
                <small className="text-success fw-bold">Dành cho: {childName || "Sĩ tử"}</small>
              </div>
              <div className="spinner-grow spinner-grow-sm text-success"></div>
            </div>
            
            <div className="p-3 chat-container" style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
              {chatHistory.length === 0 && (
                <div className="text-center py-5 opacity-50">
                  <span className="fs-1 d-block mb-2">✨</span>
                  <p className="small fw-medium">Bắt đầu trò chuyện với Cố vấn AI của bạn</p>
                </div>
              )}
              {chatHistory.map((chat, i) => (
                <div key={i} className="mb-4">
                  <div className="d-flex justify-content-end mb-2">
                    <div className="chat-bubble chat-bubble-user text-white">{chat.question}</div>
                  </div>
                  {chat.answer && (
                    <div className="d-flex justify-content-start fade-in">
                      <div className="chat-bubble chat-bubble-ai fw-medium border-0 shadow-sm">
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{chat.answer}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {aiThinking && (
                <div className="d-flex justify-content-start">
                  <div className="chat-bubble chat-bubble-ai border-0 shadow-sm px-4">
                    <div className="d-flex gap-1 py-1">
                      <div className="bg-muted opacity-50 rounded-circle" style={{ width: 6, height: 6, animation: 'fadeIn 0.6s infinite alternate' }}></div>
                      <div className="bg-muted opacity-50 rounded-circle" style={{ width: 6, height: 6, animation: 'fadeIn 0.6s infinite 0.2s alternate' }}></div>
                      <div className="bg-muted opacity-50 rounded-circle" style={{ width: 6, height: 6, animation: 'fadeIn 0.6s infinite 0.4s alternate' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-white border-top">
              <div className="d-flex gap-2">
                <input 
                  type="text" className="form-control form-input-modern border-0 bg-light py-2" 
                  placeholder="Đặt câu hỏi cho AI..." 
                  value={question} onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendToAI()}
                />
                <button 
                  className="btn-modern btn-primary p-0" 
                  style={{ width: '48px', height: '48px' }} 
                  onClick={sendToAI} disabled={aiThinking}
                >
                  <span style={{ fontSize: '1.2rem' }}>✈️</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DATALIST */}
      <datalist id="danhSachTruong">
        <option value="Hà Nội - Amsterdam (0000)" />
        <option value="Chu Văn An (0001)" />
        <option value="Phạm Hồng Thái (0103)" />
        <option value="Nguyễn Trãi - Ba Đình (0104)" />
        <option value="Tây Hồ (0105)" />
        <option value="Kim Liên (0202)" />
        <option value="Lê Quý Đôn - Đống Đa (0803)" />
        <option value="Đống Đa (0804)" />
        <option value="Quang Trung - Đống Đa (0805)" />
        <option value="Khương Đình (1321)" />
      </datalist>

      {/* ALERTS */}
      {alertMsg && (
        <div className="fade-in" style={{ position: 'fixed', bottom: '100px', left: '20px', right: '20px', zIndex: 1050 }}>
          <div className="glass-panel py-3 px-4 text-center border-primary border-opacity-25" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <span className="fw-bold text-primary">{alertMsg}</span>
          </div>
        </div>
      )}

      {/* MODAL: TỜ NHÁP */}
      {showModal && (
        <div className="modal-container">
          <div className="modal-backdrop fade show" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered px-3">
              <div className="modal-content glass-panel border-0 overflow-hidden shadow-2xl">
                <div className="gradient-header py-3 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="modal-title fw-bold m-0">📝 TỜ NHÁP ĐIỆN TỬ</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="p-4" style={{ background: 'rgba(241, 245, 249, 0.4)' }}>
                  <div className="p-3 rounded-4 mb-4 small" style={{ background: 'rgba(13, 110, 253, 0.08)', borderLeft: '4px solid var(--primary)', lineHeight: 1.5 }}>
                    💡 Sao chép thông tin để cung cấp khi đăng ký chính thức với Sở.
                  </div>
                  <pre
                    className="form-control form-input-modern mb-4 p-3 bg-white border-0 shadow-inner"
                    style={{ fontSize: '0.95rem', minHeight: '120px', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                  >
{`1. THÔNG TIN HỌC SINH
- Mã HS: ${data.maHocSinh || "(Chưa nhập)"}
- ĐT PH: ${data.sdtPhuHuynh || "(Chưa nhập)"}

2. CHIẾN LƯỢC NGUYỆN VỌNG
- NV1: ${data.nv1 || "(Chưa chốt)"}
- NV2: ${data.nv2 || "(Chưa chốt)"}
- NV3: ${data.nv3 || "(Chưa chốt)"}`}
                  </pre>
                  <button className="btn-modern btn-success w-100 py-3 shadow-sm border-0" onClick={handleCopyDraft}>
                    📋 SAO CHÉP TOÀN BỘ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

