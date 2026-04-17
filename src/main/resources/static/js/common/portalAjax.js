/**
 * 공통 AJAX 함수
 * @param {string} url - 요청할 API 주소
 * @param {string} method - 'GET' or 'POST'
 * @param {object} param - 전송할 데이터 객체 (JSON)
 * @param {function} successCallback - 성공 시 실행할 콜백 함수
 */
const fnAjaxPortal = function (url, method, param, successCallback) {
  const getPortalLoginUrl = () => {
    return `${location.protocol}//${location.host}/login`;
  };

  const redirectToLogin = () => {
    const loginUrl = getPortalLoginUrl();
    try {
      if (window.top && window.top.location) {
        window.top.location.href = loginUrl;
        return;
      }
    } catch (e) {
      // ignore and fallback to current window
    }
    window.location.href = loginUrl;
  };

  $.ajax({
    url: url,
    type: method || "POST",
    contentType: "application/json",
    data: JSON.stringify(param), // 공통에서 JSON 변환 처리

    // [옵션] JWT 토큰이 있다면 여기서 헤더 추가
    // beforeSend: function(xhr) {
    //    var token = getCookie("Authorization");
    //    if (token) xhr.setRequestHeader("Authorization", "Bearer " + token);
    // },
    dataType: "json",
    success: function (res) {
      console.log(`[Ajax Success] ${url} :: `, res);

      // 콜백 함수가 있으면 실행 (결과값 res 전달)
      if (successCallback && typeof successCallback === "function") {
        successCallback(res);
      }
    },

    error: function (xhr, status, error) {
      console.error(`[Ajax Error] ${url} :: `, error);

      // [핵심] 에러 발생 시 Thymeleaf 에러 페이지로 강제 이동
      let msg = "시스템 처리 중 오류가 발생했습니다.";

      if (xhr.status === 401) msg = "로그인 세션이 만료되었습니다.";
      else if (xhr.status === 403) msg = "접근 권한이 없습니다.";
      else if (xhr.status === 404) msg = "요청한 데이터를 찾을 수 없습니다.";

      // 한글 깨짐 방지를 위해 인코딩
      const encodedMsg = encodeURIComponent(msg);

      // 페이지 이동 (CustomErrorController가 받아서 errorPage.html 출력)
      // location.href = `/error/view?code=${xhr.status}&msg=${encodedMsg}`;
      if (xhr.status === 401 || xhr.status === 403) {
        redirectToLogin();
        return;
      }

      console.warn(`[Ajax Warn] ${url} :: code=${xhr.status}, msg=${msg}`);
    },
  });
};

const PORTAL_STATE_KEY_SYS_ID = "portal.lastSysId";
const PORTAL_STATE_KEY_MENU_URL = "portal.lastMenuUrl";
const PORTAL_STATE_KEY_MENU_TITLE = "portal.lastMenuTitle";

window.__portalMenuRestored = false;

function savePortalSystemState(sysId) {
  if (!sysId) return;
  sessionStorage.setItem(PORTAL_STATE_KEY_SYS_ID, String(sysId));
}

function savePortalMenuState(sysId, menuUrl, menuTitle) {
  if (!sysId || !menuUrl) return;
  sessionStorage.setItem(PORTAL_STATE_KEY_SYS_ID, String(sysId));
  sessionStorage.setItem(PORTAL_STATE_KEY_MENU_URL, String(menuUrl));
  sessionStorage.setItem(
    PORTAL_STATE_KEY_MENU_TITLE,
    menuTitle ? String(menuTitle) : "",
  );
}

function clearPortalMenuState() {
  sessionStorage.removeItem(PORTAL_STATE_KEY_MENU_URL);
  sessionStorage.removeItem(PORTAL_STATE_KEY_MENU_TITLE);
}

function resetPortalMenuView() {
  $("#portalMenuList .menu-item").removeClass("menu--active");
  $("#portalMenuList .has-child").addClass("closed").removeClass("open");
  $("#portalMenuList .sub-menu").hide();

  const frame = document.getElementById("workFrame");
  if (frame) frame.src = "about:blank";

  const titleArea = document.getElementById("breadcrumb");
  if (titleArea) titleArea.innerText = "";
}

function tryRestorePortalMenu(currentSysId) {
  if (window.__portalMenuRestored) return;

  const savedSysId = sessionStorage.getItem(PORTAL_STATE_KEY_SYS_ID);
  const savedUrl = sessionStorage.getItem(PORTAL_STATE_KEY_MENU_URL);
  const savedTitle = sessionStorage.getItem(PORTAL_STATE_KEY_MENU_TITLE) || "";

  if (!savedSysId || !savedUrl) return;
  if (String(savedSysId) !== String(currentSysId)) return;
  if (typeof loadMenu !== "function") return;

  window.__portalMenuRestored = true;
  loadMenu(savedUrl, savedTitle);
}
/**
 * [공통] 포털 헤더 시스템 목록 로드 및 초기화
 * @description 헤더의 시스템 목록을 조회하고 HTML을 그립니다.
 */
function initPortalHeader() {
  // 공통 Ajax 함수 사용 (fnAjax 또는 fnAjaxPortal 등 기존에 만든 것 사용)
  // 여기서는 앞서 만든 fnAjax를 사용한다고 가정합니다.
  const userId = localStorage.getItem("userId");
  fnAjaxPortal(
    "/api/portal/systemList",
    "POST",
    { userId: userId },
    function (res) {
      if (res.result) {
        drawSystemHeader(res.data);
      } else {
        console.error("시스템 목록 로딩 실패: ", res.message);
      }
    },
  );
}

/**
 * [내부 함수] 시스템 목록 HTML 그리기
 */
function drawSystemHeader(list) {
  let html = "";
  let selectedSys = null;
  const savedSysId = sessionStorage.getItem(PORTAL_STATE_KEY_SYS_ID);

  if (savedSysId) {
    selectedSys =
      list.find((sys) => String(sys.sys_id) === String(savedSysId)) || null;
  }
  if (!selectedSys && list.length > 0) {
    selectedSys = list[0];
  }

  list.forEach((sys) => {
    const isActive =
      selectedSys && String(selectedSys.sys_id) === String(sys.sys_id)
        ? "active"
        : "";

    // onclick에서 호출할 함수도 공통(global)으로 정의되어 있어야 함
    html += `<button class="system__btn ${isActive}" 
                       data-id="${sys.sys_id}" 
                       onclick="changePortalSystem('${sys.sys_id}', '${sys.sys_nm}', this)">
                       ${sys.sys_nm}
                 </button>`;
  });

  // 헤더의 컨테이너 ID에 주입
  $("#sysListContainer").html(html);

  // [초기 로딩] 첫 번째 시스템으로 사이드 메뉴 업데이트
  if (selectedSys) {
    savePortalSystemState(selectedSys.sys_id);
    if (typeof updateSideMenu === "function") {
      updateSideMenu(selectedSys.sys_id, selectedSys.sys_nm);
    }
  }
}

/**
 * [공통] 시스템 변경 클릭 이벤트 핸들러
 */
function changePortalSystem(id, name, element) {
  // 스타일 활성화 처리
  $(".system__btn").removeClass("active");
  $(element).addClass("active");
  savePortalSystemState(id);
  clearPortalMenuState();
  resetPortalMenuView();
  window.__portalMenuRestored = false;

  //메뉴 타이틀 클리어 하기
  $("#pageTitle").text("");

  // 사이드 메뉴(gnb) 업데이트 함수 호출 (menu.html에 존재)
  if (typeof updateSideMenu === "function") {
    updateSideMenu(id, name);
  } else {
    console.warn("updateSideMenu 함수가 로드되지 않았습니다.");
  }
}

function apiLogout() {
  const savedEmail = localStorage.getItem("savedEmail");
  const saveIdChecked = localStorage.getItem("saveIdChecked"); // 아이디 저장 체크 여부

  const proceed = () => {
    ajax(
      {
        url: "/api/auth/logout",
        method: "post",
        data: {},
        skipAuthRefresh: true,
        async: true,
        error: () => {
          fnAlert("로그아웃 처리 중 오류가 발생했습니다.");
        },
      },
      () => {
        localStorage.removeItem("Authorization");
        localStorage.removeItem("RefreshToken");
        localStorage.removeItem("userNm");
        localStorage.removeItem("lang");
        localStorage.removeItem("empEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("deptNm");
        localStorage.removeItem("positionNm");
        localStorage.removeItem("deptCd");
        localStorage.removeItem("empDeptAuth");

        if (savedEmail && saveIdChecked === "true") {
          localStorage.setItem("savedEmail", savedEmail);
          localStorage.setItem("saveIdChecked", "true");
        }

        window.location.href = "/login";
      },
    );
  };

  fnConfirm("로그아웃 하시겠습니까?", proceed);
}
