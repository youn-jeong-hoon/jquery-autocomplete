/*
	Name: younjhAutoComplete
	Author: Youn Jeong Hoon
	Website: https://github.com/youn-jeong-hoon/jquery-autocomplete
	Version: 0.1
*/
(function ($){
	$.fn.younjhAutoComplete = function(options){
		var $this = $(this);
		var $item = $this.children();
		var $container = $this.wrap('<div id="younjh_container"></div>').parent();
		var start;				// 왜 검색 되었는지 검색어와 일치하는 부분에 highlight를 주기 위한 index 번호 
		var result = "";		// 검색 결과 저장 변수
		var $younjh_ul;			// 검색 목록 객체
		var $younjh_input;		// textbox 객체
		var liIdx = 0;			// 방향키로 목록을 이동하기 위한 idx 변수
		var resultCnt = 0;		// limit 옵션을 적용하기 위한 option count
		var keyCode = 0;		// 입력받은 키보드의 keycode
		var liStyle = '';		// li tag style
		var bStyle = '';		// b tag style
		var en = [];			// option value encode array
		var enIdx = [];			// 인코딩 된 text로 value를 얻기 위해 en과 같은 index에 value를 저장한다.
		var resultId = [];		// 검색된 결과의 value 목록
		var option = {
				width: 151,
				height: 20,
				background: 'white',
				border: '2px solid black',
				fontSize: 10,// font-size
				fontFamily: 'Gulim, Dotum, Tahoma, Sans-serif',
				fontColor: 'black',
				list: {
					background: 'yellow',
					highlightColor: 'orange',
					limit: 10,
					showRows: 10
				},
				button: true
		};
		
		// option setting
		$.extend(option, options);
		
		makeLayout();
		$younjh_input = $("#younjh_input");
		$younjh_ul = $("#younjh_ul");
		
		// style option application
		style();
		
		// pre encoding
		$.each($item, function(){
			en.push(encodeURIComponent($(this).text()));
			enIdx.push($(this).val());
		});
		
		// event binding
		binding();
		
		function style(){
			var inputWidth = 0;		// textbox객체 width
			// 확장 버튼 
			if(option.button){
				inputWidth = option.width - 6 - option.height;
			} else {
				inputWidth = option.width - 6;
			}
			
			$container.css({
				width: option.width + 'px',
				height: option.height + 'px',
				border: option.border
			});
			
			$younjh_input.css({
				padding: '0px 3px',
				width: inputWidth + 'px',
				height: option.height + 'px',
				background: option.background,
				'font-size': option.fontSize,
				'font-family': option.fontFamily,
				'line-height': option.height + 'px',
				float: 'left',
				border: '0px none'
			});
			
			if(option.button){
				$("#younjh_show").css({
					width: option.height + 'px',
					height: option.height + 'px',
					'font-size': option.fontSize,
					'font-family': option.fontFamily,
					'line-height': option.height + 'px',
					'text-align': 'center',
					background: option.background,
					float: 'left',
					cursor: 'pointer'
				});
			}
			
			$younjh_ul.css({
				'margin-top': '20px',
				'background': option.list.background,
				border: '1px solid black',
				display: 'none',
				height: (option.list.showRows * option.height) + 'px',
				'overflow-y': 'auto',
				'font-size': option.fontSize,
				'font-family': option.fontFamily
			});
			
			 liStyle = 'padding: 0px 3px; height: 20px; line-height: 20px; overflow: hidden;';
			 bStyle = 'color: ' + option.list.highlightColor;
		}
		
		function makeLayout(){
			var tag = '';
			
			$this.hide();
			// container div
			if(option.button){
				tag = '<input type="text" id="younjh_input" value=""/><div id="younjh_show">▼</div><ul id="younjh_ul"></ul>';
			} else {
				tag = '<input type="text" id="younjh_input" value=""/><ul id="younjh_ul"></ul>';
			}
			
			$container.append(tag);
		}
		
		function search(text, keyCode, isBtn){
			var tmp = '';
			result = "";
			resultCnt = 0;
			resultId = [];
			
			// textbox에 입력된 text를 encode
			var esText = encodeURIComponent(text);
			
			// pre encode된 배열에서 입력된 text가 포함된 것을 찾는다.
			for(var z=0; z<en.length; z++){
				// 일치하는 부분에 하이라이트를 주기 위해 start index를 저장한다.
				start = en[z].search(esText);
				
				if (start > -1) {
					// 하이라이트 표시 될 문자열
					tmp = en[z].substring(start, start + (esText.length));
					// list가 선택될 경우 숨겨진 selectbox도 선택해 주기 위해 
					// li가 선택될 경우 li의 index로 resultId의 값을 찾아와서 select한다.
					result += '<li style="' + liStyle + '">' + decodeURIComponent(en[z].replace(esText, '<b style="' + bStyle + '">' + tmp + '</b>')) + '</li>';
					resultId.push(enIdx[z]);
					resultCnt += 1;
					
					if(!(keyCode == 40 && text == "") && resultCnt == option.list.limit){
						// textbox가 비어있는 상태에서 아래 방향키를 누른 경우는 전체 목록을 봐야 하므로 return을 하지 않고
						// 그렇지 않은 경우에는 limit option의 값에 따라 break 한다.
						break;
					}
				}
			}
			
			$younjh_ul.html(result);
			
			if(isBtn){
				if($younjh_ul.css("display") == "none"){
					$younjh_ul.css("display", "block");
					ulBinding();
				} else {
					$younjh_ul.css("display", "none");
				}
			} else {
				$younjh_ul.css("display", "block");
				ulBinding();
				
			}
			
			delayTimer = null;
		}
		
		function ulBinding(){
			$younjh_ul.children().bind("click", function(){
				$younjh_input.val($(this).text());
				$this.val(resultId[$(this).index()]);
				$younjh_ul.css("display", "none");
			}).hover(function(){
				$(this).addClass("younjh-selected");
			}, function(){
				$(this).removeClass("younjh-selected");
			});
		}
		
		function binding(){
			// 마우스가 목록을 벗어나면 숨김
			$younjh_ul.bind('mouseleave', function(){
				liIdx = 0;
				$(this).css("display", "none");
			});
			
			// 검색어 입력
			$younjh_input.keyup(function(){
				var text = $younjh_input.val();
				
				keyCode = event.keyCode;
				
				if(keyCode == 40){
					// 아래 방향키 : 40
					// active 효과를 이동하면서 스크롤도 이동시킨다.
					if($younjh_ul.css("display") == "none"){
						liIdx = 0;
						search(text, keyCode);
						$younjh_ul.css("display", "block");
					}
					
					if(liIdx < resultCnt){
						$("li:nth-child(" + liIdx + ")", $younjh_ul).removeClass("younjh-selected");
						$("li:nth-child(" + (++liIdx) + ")", $younjh_ul).addClass("younjh-selected");
						if(liIdx > 10){
							$younjh_ul.scrollTop((liIdx-option.list.showRows) * 20);
						}
						
					}
				} else if(keyCode == 38) {
					// up key
					// up key를 누른 경우 active 효과를 이동하면서 스크롤도 이동시킨다.
					if(liIdx > 0){
						$("li:nth-child(" + liIdx + ")", $younjh_ul).removeClass("younjh-selected");
						$("li:nth-child(" + (--liIdx) + ")", $younjh_ul).addClass("younjh-selected");
						$younjh_ul.scrollTop((liIdx-option.list.showRows) * 20);
					}
				} else {
					var text = $younjh_input.val();
					
					if(keyCode == 8){
						//backspace
						liIdx = 0;
						
						if(text == ""){
							$younjh_ul.css("display", "none");
							return;
						}
						
						search(text, keyCode, false);
					} else if(keyCode == 13) {
						// enter를 입력한 경우 방향키를 이용하여 active 상태가 된 li가 있다면 selectbox에 선택하고 textbox에 text를 보여준다.
						var $selected = $("#younjh_ul li.younjh-selected");
						var v = $selected.index();

						if(v > -1){
							$younjh_input.val($selected.text());
							$this.val(resultId[$(this).index()]);
							$younjh_ul.css("display", "none");
						}
						
					} else {
						search(text, keyCode, false);
					}
				}
			});
			
			$("#younjh_show").click(function(){
				var text = $younjh_input.val();
				
				search(text, keyCode, true);
			});
		}
                return this;
	};
})(jQuery);