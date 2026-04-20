/* login.js */
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  // [추가] 요소 선택
  const emailInput = loginForm.querySelector('input[name="email"]');
  const passwordInput = loginForm.querySelector('input[name="password"]');
  // HTML에 id="saveId"를 추가했다고 가정. (없으면 .login__form--option input[type='checkbox'] 로 선택)
  const saveIdCheckbox = document.getElementById("saveId") || document.querySelector(".login__form--option input[type='checkbox']");

  // -----------------------------------------------------------
  // [로직 1] 화면 로드 시 저장된 아이디 확인 및 세팅
  // -----------------------------------------------------------
  const savedEmail = localStorage.getItem("savedEmail");
  if (savedEmail) {
      if (emailInput) {
          emailInput.value = savedEmail; // 이메일 입력창 채우기
      }
      if (saveIdCheckbox) {
          saveIdCheckbox.checked = true; // 체크박스 체크하기
      }
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailValue = emailInput ? emailInput.value.trim() : "";
    const passwordValue = passwordInput ? passwordInput.value.trim() : "";

    if (!emailValue) {
      fnAlert("이메일을 확인해주세요.", () => {
        if (emailInput) emailInput.focus();
      });
      return;
    }

    if (!passwordValue) {
      fnAlert("비밀번호를 입력해주세요.", () => {
        if (passwordInput) passwordInput.focus();
      });
      return;
    }

    const loginData = {
      empEmail: emailValue,
      empPassword: passwordValue,
      lang: "KO",
    };

    console.log("login attempt...");

    ajax(
      {
        url: "/api/auth/login",
        method: "post",
        data: loginData,
        skipAuthRefresh: true,
        async: true,
        error: () => {
          fnAlert("이메일 또는 비밀번호를 확인해주세요.", () => {
            if (passwordInput) {
              passwordInput.value = "";
              passwordInput.focus();
            }
          });
        },
      },
      (data) => {

		localStorage.clear();
		sessionStorage.clear();
		
		localStorage.setItem("Authorization", data.token);  // JWT 토큰
		localStorage.setItem("userNm", data.userNm);   //이름
		localStorage.setItem("siteLang", data.lang);   //언어모드
    localStorage.setItem("lang", data.lang);
		localStorage.setItem("userId", data.userId);
		localStorage.setItem("deptNm", data.deptNm);
		localStorage.setItem("deptCd", data.deptCd);
		localStorage.setItem("positionNm", data.positionNm);
		localStorage.setItem("empDeptAuth", data.empDeptAuth);
		
		document.cookie = `userNm=${encodeURIComponent(data.userNm)}; path=/; max-age=86400`;
		document.cookie = `siteLang=${data.lang}; path=/; max-age=86400`;
		document.cookie = `userId=${data.userId}; path=/; max-age=86400`;
		document.cookie = `deptNm=${encodeURIComponent(data.deptNm)}; path=/; max-age=86400`;
		document.cookie = `deptCd=${data.deptCd}; path=/; max-age=86400`;
		document.cookie = `positionNm=${encodeURIComponent(data.positionNm)}; path=/; max-age=86400`;
		document.cookie = `empDeptAuth=${encodeURIComponent(data.empDeptAuth)}; path=/; max-age=86400`;
		   
        if (saveIdCheckbox && saveIdCheckbox.checked) {
            localStorage.setItem("savedEmail", emailValue);
        } else {
            localStorage.removeItem("savedEmail");
        }
        localStorage.setItem("empEmail", emailValue);

        window.location.href = "/main";
      },
    );
  });
});