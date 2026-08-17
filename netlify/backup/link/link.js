      // 定数をページに反映
      document.getElementById('title').innerText = TITLE;
      document.getElementById('message').innerText = MSG;
      document.getElementById('download-link').href = DLFILE;
			document.getElementById('move-button').addEventListener('click', () => {
	        window.location.href = URL;
	    });
	    
      const progressBar = document.getElementById('progress-bar');
      
      const timer = setInterval(() => {
          timeLeft -= 0.1;
          const progress = (5 - timeLeft) / 5 * 100;
          progressBar.style.width = progress + '%';

          if (timeLeft <= 0) {
              clearInterval(timer);
              window.location.href = URL; // 移動先URL
          }
      }, 100);

      function stopRedirect() {
          clearInterval(timer); // タイマー停止
          document.getElementById('message').innerText = "移動を停止しました。";
          document.getElementById('progress-container').style.display = 'none';
					if (DLFILE !=="") {
	          document.getElementById('download-area').style.display = 'block';
					}
      }
