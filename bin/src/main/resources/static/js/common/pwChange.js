document.addEventListener("DOMContentLoaded", function () {
  const openPwChangeBtn = document.getElementById("openPwChange");
  const pwChangeForm = document.getElementById("pwChangeForm");
  const pwChangeLayer = document.getElementById("pwChangeLayer");
  
  const closeBtn =
    pwChangeLayer && pwChangeLayer.querySelector(".close-box button");
  const cancelBtn =
    pwChangeLayer && pwChangeLayer.querySelector(".layer__btns .btn--gray");
  const submitBtn =
    pwChangeForm && pwChangeForm.querySelector('button[type="submit"]');

	
	
	
  function resetPwChangeForm() {
    if (!pwChangeForm) return;
    pwChangeForm.reset();

    if (submitBtn) {
      submitBtn.setAttribute("disabled", "disabled");
    }

    const newPwMsg = document.getElementById("newPwMsg");
    const confirmPwMsg = document.getElementById("confirmPwMsg");
    if (newPwMsg) newPwMsg.textContent = "";
    if (confirmPwMsg) confirmPwMsg.textContent = "";
  }

  function openPwChangeModal() {
    if (typeof layerPopup !== "function") return;
    layerPopup("pwChangeLayer");
	const preEmailInput = document.getElementById("loginEmail")
	const saveIdCheckbox = document.getElementById("saveId") || document.querySelector(".login__form--option input[type='checkbox']");
	const savedEmail = localStorage.getItem("savedEmail");  
	const emailInput = document.getElementById("pwEmail");
	
	if(saveIdCheckbox && saveIdCheckbox.checked){
		if (preEmailInput) {
			emailInput.value = preEmailInput.value; // 이메일 입력창 채우기
		}
		
	} else {
		if(savedEmail){
			//emailInput.value = savedEmail; // 저장된 이메일
		}
	}
	     
	if (emailInput) emailInput.focus();
  }

  function closePwChangeModal() {
    if (typeof layerPopupClose !== "function") return;
    layerPopupClose("pwChangeLayer");
    resetPwChangeForm();
  }

  if (openPwChangeBtn) {
    openPwChangeBtn.addEventListener("click", function (e) {
      e.preventDefault();
	  
	  console.log("openPwChangeBtn openPwChangeModal 123");
	  
      openPwChangeModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closePwChangeModal();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closePwChangeModal();
    });
  }

  if (!pwChangeForm) return;

  const emailInput = pwChangeForm.querySelector('input[name="email"]');
  const prePwInput = document.getElementById("prePw");    //현재 비밀번호 
  const newPwInput = document.getElementById("newPw");
  const confirmPwInput = document.getElementById("confirmPw");

  if (!newPwInput || !confirmPwInput) return;

  const newPwMsg = document.getElementById("newPwMsg");
  const confirmPwMsg = document.getElementById("confirmPwMsg");

  let isNewPwValid = false;
  let isConfirmPwValid = false;

  document.querySelectorAll(".toggle-pw").forEach((icon) => {
    icon.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      if (targetInput.type === "password") {
        targetInput.type = "text";
        this.classList.remove("fa-eye-slash");
        this.classList.add("fa-eye");
      } else {
        targetInput.type = "password";
        this.classList.remove("fa-eye");
        this.classList.add("fa-eye-slash");
      }
    });
  });

  function checkFormValidity() {
	
	const emailValue = emailInput ? emailInput.value.trim() : "";
    const hasEmail = !!emailValue;

    if (hasEmail && isNewPwValid && isConfirmPwValid) {
      if (submitBtn) submitBtn.removeAttribute("disabled");
    } else {
      if (submitBtn) submitBtn.setAttribute("disabled", "disabled");
    }
	

	
  }

  newPwInput.addEventListener("input", function () {
    const pw = this.value;
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,20}$/;

    if (pw.length === 0) {
      if (newPwMsg) newPwMsg.textContent = "";
      isNewPwValid = false;
    } else if (!regex.test(pw)) {
      if (newPwMsg) {
        newPwMsg.textContent =
          "영문, 숫자, 특수문자를 모두 포함하여 8~20자로 입력해주세요.";
        newPwMsg.className = "validation-msg msg-error";
      }
      isNewPwValid = false;
    } else {
      if (newPwMsg) {
        newPwMsg.textContent = "사용 가능한 비밀번호입니다.";
        newPwMsg.className = "validation-msg msg-success";
      }
      isNewPwValid = true;
    }

    confirmPwInput.dispatchEvent(new Event("input"));
    checkFormValidity();
  });

  confirmPwInput.addEventListener("input", function () {
    const confirmPw = this.value;
    const newPw = newPwInput.value;

    if (confirmPw.length === 0) {
      if (confirmPwMsg) confirmPwMsg.textContent = "";
      isConfirmPwValid = false;
    } else if (newPw !== confirmPw) {
      if (confirmPwMsg) {
        confirmPwMsg.textContent = "비밀번호가 일치하지 않습니다.";
        confirmPwMsg.className = "validation-msg msg-error";
      }
      isConfirmPwValid = false;
    } else {
      if (confirmPwMsg) {
        confirmPwMsg.textContent = "비밀번호가 일치합니다.";
        confirmPwMsg.className = "validation-msg msg-success";
      }
      isConfirmPwValid = true;
    }
    checkFormValidity();
  });

  if (emailInput) {
    emailInput.addEventListener("input", checkFormValidity);
  }

  pwChangeForm.addEventListener("submit", function (e) {
    e.preventDefault();
	const prePwValue = prePwInput ? prePwInput.value.trim() : "";  //현재 비밀번호
    const emailValue = emailInput ? emailInput.value.trim() : "";
	
	if (!prePwValue) {
	  fnAlert("현재비밀번호를 확인해주세요.", () => {
	    if (prePwInput) prePwInput.focus();
	  });
	  return;
	}	
	
    if (!emailValue) {
      fnAlert("이메일을 확인해주세요.", () => {
        if (emailInput) emailInput.focus();
      });
      return;
    }

    if (!isNewPwValid || !isConfirmPwValid) return;


    const requestData = {
      empEmail: emailValue,
	  empPassword: prePwValue,
      //newEmpPassword: "1234", // newPwInput.value
	  newEmpPassword: newPwInput.value, // newPwInput.value
    };
    
	console.log("requestData :: ", JSON.stringify(requestData));
	
    ajax(
      {
        url: "/api/auth/change-password",
        method: "post",
        data: requestData,
        async: true,
        error: () => {
          fnAlert("서버 통신 중 오류가 발생했습니다.");
        },
      },
      (res) => {
        if (res && res.success) {
          fnAlert(
            "비밀번호가 성공적으로 변경되었습니다.\n다시 로그인해주세요.",
            () => {
              location.href = "/login";
            },
          );
        } else {
          fnAlert(res?.message || "비밀번호 변경에 실패했습니다.");
        }
      },
    );
  });
});
