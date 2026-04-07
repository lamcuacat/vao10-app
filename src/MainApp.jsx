import React, { useState, useEffect, useRef } from 'react';

// CHÚ Ý: Sau khi Deploy Code.js dưới dạng Web App, dán đường link đó vào đây:
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2s0X7qsvCjjkSJlJD5uq9ukzvS_IzRz97JRYyvtPdI5Z9iu15YvBlSTxIZliAf9rrvA/exec";

export default function MainApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ nv1: '', nv2: '', nv3: '' }); // Simplified state
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  const phone = localStorage.getItem('vao10_phone');
  const apiKey = localStorage.getItem('vao10_apikey');
  const parentName = localStorage.getItem('vao10_parent');
  const childName = localStorage.getItem('vao10_child');

  useEffect(() => {
    // Tải dữ liệu ban đầu
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getInitialData",
        phone, fatherName: parentName, childName
      }) // Không gửi nội dung Type json để tránh CORS preflight
    }).then(res => res.json()).then(res => {
      if (res.data) setData(res.data);
      if (res.chatHistory) setChatHistory(res.chatHistory);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [phone, childName, parentName]);

  const sendToAI = async () => {
    if (!question.trim()) return;
    
    const newChat = [...chatHistory, { user: parentName, question: question, answer: null }];
    setChatHistory(newChat);
    setQuestion("");
    setAiThinking(true);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "askAI",
          phone,
          question,
          chatContext: chatHistory.map(c => `Phụ huynh: ${c.question}\nAI: ${c.answer}`).join("\n"),
          apiKey,
          names: { parentName, childName, nv1: data.nv1, nv2: data.nv2, nv3: data.nv3 }
        })
      });
      const resJSON = await response.json();
      
      const updatedChat = [...newChat];
      updatedChat[updatedChat.length - 1].answer = resJSON.answer || "Lỗi kết nối AI.";
      setChatHistory(updatedChat);
    } catch(err) {
      alert("Lỗi khi kết nối với AI!");
    }
    setAiThinking(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, aiThinking]);

  if (isLoading) return <div className="text-center mt-5"><h4>Đang đồng bộ dữ liệu gia đình...</h4></div>;

  return (
    <div className="container" style={{ maxWidth: '600px', margin: 'auto', paddingBottom: '70px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER BẢN QUYỀN */}
      <div className="text-center mb-4 p-3" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', borderRadius: '0 0 20px 20px', boxShadow: '0 4px 15px rgba(30, 60, 114, 0.15)' }}>
        <h3 className="fw-bold mb-1">🚀 CÙNG CON VÀO 10</h3>
        <p className="mb-0 small">Bản lĩnh tự tin • Tối ưu quyết định • Chắc suất trường ngon!</p>
        <button className="btn btn-sm btn-outline-light mt-2" onClick={onLogout}>🚪 Đăng xuất ({phone})</button>
      </div>

      {/* NAV TABS */}
      <div className="d-flex justify-content-between mb-4 bg-white p-2" style={{ borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <button className={`btn w-100 ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-light'} rounded-pill`} onClick={() => setActiveTab('dashboard')}>🎯 Tuyển Sinh</button>
        <button className={`btn w-100 ${activeTab === 'ai' ? 'btn-primary' : 'btn-light'} rounded-pill`} onClick={() => setActiveTab('ai')}>✨ AI Live</button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'dashboard' && (
        <div className="card shadow-sm border-0" style={{ borderRadius: '20px' }}>
          <div className="card-header bg-white pt-4 border-0">
            <h5 className="fw-bold text-primary mb-0">CHIẾN LƯỢC CỦA {childName?.toUpperCase()}</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label text-danger fw-bold">NV 1 (Mơ ước):</label>
              <input className="form-control" value={data.nv1 || ''} onChange={e => setData({...data, nv1: e.target.value})} placeholder="Chọn trường NV1..." />
            </div>
            <div className="mb-3">
              <label className="form-label text-warning fw-bold">NV 2 (An toàn):</label>
              <input className="form-control" value={data.nv2 || ''} onChange={e => setData({...data, nv2: e.target.value})} placeholder="Chọn trường NV2..." />
            </div>
            <div className="mb-3">
              <label className="form-label text-success fw-bold">NV 3 (Chắc chắn):</label>
              <input className="form-control" value={data.nv3 || ''} onChange={e => setData({...data, nv3: e.target.value})} placeholder="Chọn trường NV3..." />
            </div>
            <button className="btn btn-primary w-100 mt-2 fw-bold" style={{ borderRadius: '14px', padding: '12px' }} onClick={() => alert("Chức năng Lưu đang được nâng cấp!")}>💾 LƯU BẢNG CHỐT</button>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="card shadow-sm border-0" style={{ borderRadius: '20px', height: '600px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header bg-white pt-3 border-0">
            <h5 className="fw-bold mb-0">Cố vấn Tuyển sinh AI (Live)</h5>
            <small className="text-success fw-bold">Trợ lý dành riêng cho gia đình {parentName}</small>
          </div>
          <div className="card-body p-3" style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
            {chatHistory.map((chat, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-end mb-2">
                  <div className="p-2 px-3 text-white" style={{ background: '#1e3c72', borderRadius: '15px 15px 0 15px', maxWidth: '85%' }}>{chat.question}</div>
                </div>
                {chat.answer && (
                  <div className="d-flex justify-content-start">
                    <div className="p-2 px-3 bg-white border" style={{ borderRadius: '15px 15px 15px 0', maxWidth: '85%' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{chat.answer}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {aiThinking && <div className="text-muted small fst-italic">✨ AI đang suy nghĩ...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="card-footer bg-white border-0 p-3">
            <div className="d-flex gap-2">
              <input 
                type="text" className="form-control" placeholder="Hỏi Cố vấn AI..." 
                value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendToAI()}
                style={{ borderRadius: '20px' }}
              />
              <button className="btn btn-primary" style={{ borderRadius: '20px', padding: '0 20px' }} onClick={sendToAI} disabled={aiThinking}>Gửi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
