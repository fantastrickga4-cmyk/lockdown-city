// child-bridge.js — iframe 내부 페이지에서 부모로 사용자 인터랙션을 전달
// 부모(ambient.js)는 이 메시지를 받고 audio context를 시작/재개함 (브라우저 자동재생 정책 우회)
(function () {
  if (window.top === window) return; // 단독 페이지로 열린 경우 작동 안 함

  function notify() {
    try {
      window.parent.postMessage({ type: 'lockdown-interaction' }, '*');
    } catch (e) { /* silent */ }
  }

  // 모든 클릭/키 입력을 부모에 알림 (capture 단계에서 잡아 가장 빨리)
  document.addEventListener('click', notify, true);
  document.addEventListener('keydown', notify, true);
  document.addEventListener('touchstart', notify, true);
})();
