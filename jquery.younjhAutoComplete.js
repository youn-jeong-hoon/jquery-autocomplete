/*
	Name: younjhAutoComplete
	Author: Youn Jeong Hoon
	Website: https://github.com/youn-jeong-hoon/jquery-autocomplete
	Version: 0.1
*/
(function ($){
	var methods = {
		init : function( options ) {
			return this.each(function() {
				var $this = $(this);
				
				var option = {
						width: 151,
						height: 20,
						background: 'white',
						border: '2px solid black',
						fontSize: 11,
						fontFamily: 'Gulim, Dotum, Tahoma, Sans-serif',
						fontColor: 'black',
						list: {
							background: 'white',
							border: '1px solid black',
							zIndex: 100000,
							limit: 10,
							showRows: 10
						},
						button: true
				};
				
				var $item = $this.children();
				var $container = $this.wrap('<div class="younjh_container"></div>').parent();
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
				var ulId = 'younjh_' + $this.attr("id") + '_ul';
				var inputId = 'younjh_' + $this.attr("id") + '_input';
				var showId = 'younjh_' + $this.attr("id") + '_show';
				var defaultValue = $this.val();
				
				// option setting
				$.extend(true, option, options);

				makeLayout();
				$younjh_input = $("#" + inputId);
				$younjh_ul = $("#" + ulId);

				// style option application
				style();

				// pre encoding
				$.each($item, function(){
					en.push(encodeURIComponent($(this).text()));
					enIdx.push($(this).val());
				});

				// event binding
				binding();
				
				if(defaultValue != undefined){
					$younjh_input.val($(this).children().filter('option[value=' + $(this).val() + ']').text());
				}

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
						background: option.background,
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
						$("#" + showId).css({
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
						'margin': '20px 0px 0px 0px',
						'background': option.list.background,
						position: 'absolute',
						width: (option.width-2) + 'px',
						border: option.list.border,
						height: (option.list.showRows * option.height) + 'px',
						'overflow-y': 'auto',
						'font-size': option.fontSize,
						'font-family': option.fontFamily,
						display: 'none',
					});

					liStyle = 'padding: 0px 3px; height: 20px; line-height: 20px; overflow: hidden;';
					bStyle = 'color: ' + option.list.highlightColor;
				};
				
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
						start = en[z].indexOf(esText);

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
				};

				function makeLayout(){
					var tag = '';

					$this.hide();
					// container div
					if(option.button){
						tag = '<input type="text" id="' + inputId + '" value=""/><div id="' + showId + '">▼</div><ul id="' + ulId + '"></ul>';
					} else {
						tag = '<input type="text" id="' + inputId + '" value=""/><ul id="' + ulId + '"></ul>';
					}

					$container.append(tag);
				};

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
				};

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
								var $selected = $("#" + ulId + " li.younjh-selected");
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

					$("#" + showId).click(function(){
//						var text = $younjh_input.val();
						var text = "";

						search(text, keyCode, true);
					});
				}
			});
		},
		disabled : function(isBoolean) { 
			return this.each(function() {
				var $this = $(this);
				var id = $this.attr("id");
				var ulId = 'younjh_' + id + '_ul';
				var inputId = 'younjh_' + id + '_input';
				var showId = 'younjh_' + id + '_show';
				var $younjh_input = $("#" + inputId);
				
				if(isBoolean){
					$younjh_input.attr("disabled", true);
					$("#" + showId).hide();
					$("#" + ulId).hide();
				} else {
					$younjh_input.attr("disabled", false);
					$("#" + showId).show();
				}
			});
		}
	};
	
	$.fn.younjhAutoComplete = function(method){
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	};
})(jQuery);