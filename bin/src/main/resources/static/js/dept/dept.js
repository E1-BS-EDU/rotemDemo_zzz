/* 다국어 그리드 및 데이터 */
let gridData = [];
let grid = [];
/* 그리드 내부 유형 콤보 렌더링 */
let typeValue = [];
let typeText = [];
let listItemsType = [];
/* 그리드 내부 언어 콤보 렌더링 */
let langValue = [];
let langText = [];
let listItemsLang = [];
//다국어
//공통코드
//let comCdList= ["DNP0012","DNP0014"];
let comCdList= ["DNP0014"];  //언어

//다국어 Map
const headerMap = new Map();
//페이지 로딩 시
$(document).ready(() =>{
    //초기 조회 함수
    loadInit();
})

/*초기 필수 조회 함수  */
const loadInit  = () => {
    //페이지 이동을 위한 경로 Setting
	console.log("그리드 초기화");
	gridInit();
}


//조회 함수
const search = () => {

	let cond = {
	  mlgObjNm: $('#codeNm').val(),
	  langCd: $('#lang').val()
	};

	console.log("조회 파라메터 :: ", JSON.stringify(cond));
	
	toast.draw.table.reload("grid", cond);
	
}


// tui 그리드 초기 설정
const gridInit = () => {
	
	let TextInputRenderer = function(props) {
	    let el = document.createElement('input');
	    el.type = 'text';

	    el.style.fontSize = '12px';
	    el.style.width = 'calc(100% - 10px)';
	    el.style.padding = '6px 7px';
	    el.style.border = 'solid 1px #ddd';
	    el.style.margin = 'auto 5px';
	    el.spellcheck = false;

	    this.el = el;
	    this.render(props);
	}

	TextInputRenderer.prototype.getElement = function () {
	    return this.el;
	}

	TextInputRenderer.prototype.render = function (props) {
	    this.el.value = props.value;
	}
		
  const columns = [
	{ header: 'No', name: 'rn', width: 60, align: 'center'},   //  순번
	{ header: '코드', name: 'mlgObjId',  width: 120, align: 'center', },//다국어: 코드
	{ header: '한/영', name: 'langCd',    width: 80,  align: 'center', },//다국어: 코드명
	{ header: '도메인', name: 'typeCd',    width: 80, align: 'left',  },//다국어: 코드명
	{ header: '코드명', name: 'mlgObjNm',  align: 'left',  },//다국어: 코드명
  ];

  const server = {
    url: "",  ///lang/json
    param: {
		mlgObjNm: $('#codeNm').val(),
    },
    initParamRequired: true,
  };

  const tableConfig = {
    rowCheck: true,
    rowNum: false,
    pagging: true,
    perPage: 20,
    height: 600,
    columnOptions: { resizable: true },
  };

  grid = toast.draw.table("#grid", columns, server, tableConfig);

};


