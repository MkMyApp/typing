		const subject = document.getElementById('editor');

		subject.addEventListener('keydown', (event) => {
		      const key = event.key;
		      if (/^[ -~]$/.test(key)) {
					    window.speechSynthesis.cancel();
					    const utterance = new SpeechSynthesisUtterance(key);
					    utterance.lang = 'en-US';
					    utterance.rate = 1;
					    window.speechSynthesis.speak(utterance);
		      }
		});
