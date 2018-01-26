/**
 * 主打消息盒子
 * @auto jzw
 * @version 1.0.0
 * @history
 *   1.0.0 完成消息盒子的最基本功能
 */
;(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD模式
    define([ "jquery" ], factory);
  } else {
    // 全局模式
    factory(jQuery);
  }
}(function ($) {
  $.fn.shortmessagebox = function (options) {
    var defaultOption = {
      boxTop: 0, // 距离顶部高度
      boxBottom: 0, // 距离底部高度
      menuWidth: 300, // 菜单宽度
      toolBoxHeight: 50, // 工具栏高度
      today: '2018-01-17', // 当天日期
      messages: [
        {
          img: 'img/news.png',
          title: '新闻',
          time: '2018-01-17 10:10',
          content: '中国联通'
        }
      ], // 消息
      tools: [
        {
          img: 'img/setting.png',
          imgHover: 'img/setting_hover.png',
          doClick: function (e) {}
        }
      ], // 工具
      clickMessage: function (index, message, messages) {}
    }
    var opt = $.extend(defaultOption, options);

    var $shortMessageBox = $(this);
    init($shortMessageBox, opt);
    $(window).resize(function () {
      resize($shortMessageBox, opt);
    });
    var menuObj = {
      isMenuOpen: false
    };
    return {
      isMenuOpen: function () {
        return menuObj.isMenuOpen;
      },
      openMenu: function () {
        openMenu($shortMessageBox, menuObj, opt);
      },
      closeMenu: function () {
        closeMenu($shortMessageBox, menuObj, opt);
      },
      refreshMessage: function (messages, today) {
        refreshMessage($shortMessageBox, null, messages, today, opt);
      }
    }
  }

  /**
   * 初始化
   * @param  {[type]} $shortMessageBox [description]
   * @param  {[type]} opt              [description]
   * @return {[type]}                  [description]
   */
  function init($shortMessageBox, opt) {
    $shortMessageBox.addClass('shortmessagebox');
    $shortMessageBox.css({
      'right': - opt.menuWidth + 'px'
    });
    // 构建dom节点
    constructDoms($shortMessageBox, opt);
    resize($shortMessageBox, opt);
    // 隐藏其他标签内容
    
    // tab标签切换
    $shortMessageBox.on('click', '.shortmessagebox-toptabtitle', function (e) {
      // 标签按钮样式切换
      var $tabItem = $(this).parent();
      $tabItem.addClass('shortmessagebox-toptabitem__active').siblings('.shortmessagebox-toptabitem').removeClass('shortmessagebox-toptabitem__active');
      // 标签内容切换
      var tabIndex = $tabItem.index();
      $shortMessageBox.find('.shortmessagebox-toptabcontentitem').hide().eq(tabIndex).show();
    });
    // placeholder相关
    var $placeholder = $shortMessageBox.find('.shortmessagebox-queryplaceholder');
    $shortMessageBox.on('click', '.shortmessagebox-queryplaceholder', function (e) {
      $shortMessageBox.find('.shortmessagebox-queryinput').focus();
    });
    // placeholder隐藏
    $shortMessageBox.on('focus', '.shortmessagebox-queryinput', function (e) {
      $placeholder.hide();
    });
    // placeholder显示
    $shortMessageBox.on('blur', '.shortmessagebox-queryinput', function (e) {
      if ($(this).val().length) {
        $placeholder.hide();
      } else {
        $placeholder.show();
      }
    });
    // tool栏
    $shortMessageBox.on('mouseenter', '.shortmessagebox-toolitema', function (e) {
      $(this).children(':first-child').hide();
    });
    $shortMessageBox.on('mouseleave', '.shortmessagebox-toolitema', function (e) {
      $(this).children(':first-child').show();
    });
  }

  /**
   * 构建dom节点
   * @param  {[type]} $shortMessageBox [消息盒子]
   * @param  {[type]} opt              [配置参数]
   * @return {[type]}                  [void]
   */
  function constructDoms($shortMessageBox, opt) {
    var $boxContent = $shortMessageBox.children();
    var $tabBox = $('<div class="shortmessagebox-tabbox"></div>');
    // 标签栏
    var $topTab = $('<dl class="shortmessagebox-toptab"></dl>');
    $boxContent.each(function (i, element) {
      var $topTabItem = $('<dd class="shortmessagebox-toptabitem">'
          + '<a class="shortmessagebox-toptabtitle">' + $(element).attr('title') + '</a>'
        + '</dd>');
      if (i === 0) {
        $topTabItem.addClass('shortmessagebox-toptabitem__active');
      }
      $topTab.append($topTabItem);
    })
    $topTab.append('<dd class="shortmessagebox-end"></dd>');
    $tabBox.append($topTab);

    // 标签内容部分
    var $tabContent = $('<dl class="shortmessagebox-toptabcontent"></dl>');
    $boxContent.each(function (i, element) {
      var $element = $(element);
      var $tabContentItem;
      if (i === 0) {
        $tabContentItem = $('<dd class="shortmessagebox-toptabcontentitem"></dd>');
      } else {
        $tabContentItem = $('<dd class="shortmessagebox-toptabcontentitem" style="display: none;"></dd>');
      }
      $tabContent.append($tabContentItem);
      if ($element.attr('content') === 'message') {
        // // 在消息容器上加上一个message标志
        // $tabContentItem.attr({
        //   'flag': 'message'
        // });
        $tabBox.append($tabContent);
        // 搜索栏
        var $queryBox = $('<div class="shortmessagebox-querybox">'
            + '<div><img src="img/query2.png" class="shortmessagebox-queryicon">'
              + '<label class="shortmessagebox-queryplaceholder">搜索' + opt.messages.length + '条消息</label>'
              + '<input type="text" class="shortmessagebox-queryinput">'
            + '</div>'
          + '</div>');
        $tabContentItem.append($queryBox);
        // 消息栏
        var $messageBox = $('<div class="shortmessagebox-messagebox"></div>');
        $tabContentItem.append($messageBox);
        refreshMessage($shortMessageBox, $messageBox, opt.messages, opt.today, opt);
      } else {
        // 其他标签栏的内容
        $tabContentItem.append($element.html());
      }
    });
    $tabContent.append('<dd class="shortmessagebox-end"></dd>');

    // 工具栏部分，工具过多时未作处理，如有需要，请自行修改
    var $toolBox = $('<div class="shortmessagebox-toolbox"></div>');
    var $toolList = $('<dl class="shortmessagebox-toollist"></dl>');
    $toolBox.append($toolList);
    for (var i = 0; i < opt.tools.length; i++) {
      var tool = opt.tools[i];
      var $toolItem = $('<dd class="shortmessagebox-toolitem"></dd>');
      var $toolItemA = $('<a class="shortmessagebox-toolitema">'
          + '<img src="' + tool.img + '" class="shortmessagebox-toolitemimg shortmessagebox-toolitemimg__default">'
          + '<img src="' + tool.imgHover + '" class="shortmessagebox-toolitemimg">'
        + '</a>');
      bindToolClick($toolItemA, tool.doClick);
      $toolItem.append($toolItemA);
      $toolList.append($toolItem);
    }

    // 加入这些节点
    $shortMessageBox.empty();
    $shortMessageBox.append($tabBox);
    $shortMessageBox.append($toolBox);
  }

  /**
   * 将日期字符串转化为Date
   * @param  {[type]} dateStr 格式为yyyy-MM-dd
   * @return {[type]}         返回Date
   */
  function convertStr2Date(dateStr) {
    var year = parseInt(dateStr.substring(0, 4));
    var month = parseInt(dateStr.substring(5, 7)) - 1;
    var day = parseInt(dateStr.substring(8, 10));
    return new Date(year, month, day);
  }

  function getShowTimeObj(dateString, today, todate) {
    var dateObj = {};
    var dateStr = dateString.substring(0, 10);
    var timeStr = dateString.substring(11);
    if (today === dateStr) {
      dateObj.title = '今天';
      dateObj.showTime = timeStr;
    } else {
      var date = convertStr2Date(dateStr);
      if (todate - 24 * 3600 * 1000 === date.getTime()) {
        dateObj.title = '昨天';
        dateObj.showTime = '昨天 ' + timeStr;
      } else {
        dateObj.title = '更早';
        dateObj.showTime = date.getMonth() + 1 + '月' + date.getDate() + '日 ' + timeStr;
      }
    }
    return dateObj;
  }

  /**
   * 调整大小、高度
   * @param  {[type]} $shortMessageBox [description]
   * @param  {[type]} opt              [description]
   * @return {[type]}                  [description]
   */
  function resize($shortMessageBox, opt) {
    var height = $(window).height();
    // 菜单样式
    $shortMessageBox.css({
      'top': opt.boxTop + 'px',
      'width': opt.menuWidth + 'px'
    });
    // 标签与标签内容页面总体高度
    $shortMessageBox.find('.shortmessagebox-tabbox').css({
      'height': height - opt.boxTop - opt.boxBottom - opt.toolBoxHeight + 'px'
    });
    // 工具栏高度
    $shortMessageBox.find('.shortmessagebox-toolbox').css({
      'height': opt.toolBoxHeight + 'px'
    });
  }

  /**
   * 打开菜单
   * @param  {[type]} $shortMessageBox [description]
   * @param  {[type]} menuObj          [description]
   * @param  {[type]} opt              [description]
   * @return {[type]}                  [description]
   */
  function openMenu($shortMessageBox, menuObj, opt) {
    $shortMessageBox.stop().animate({
      'right': '0px'
    }, 'normal', 'swing', function () {
      menuObj.isMenuOpen = true;
    });
  }

  /**
   * 关闭菜单
   * @param  {[type]} $shortMessageBox [description]
   * @param  {[type]} menuObj          [description]
   * @param  {[type]} opt              [description]
   * @return {[type]}                  [description]
   */
  function closeMenu($shortMessageBox, menuObj, opt) {
    $shortMessageBox.stop().animate({
      'right': - opt.menuWidth + 'px'
    }, 'normal', 'swing', function () {
      menuObj.isMenuOpen = false;
    });
  }

  function bindToolClick($a, doClick) {
    $a.click(function (e) {
      doClick(e);
    });
  }

  function bindMessageClick($dom, doClick, index, message, messages) {
    $dom.click(function (e) {
      doClick(index, message, messages, e);
    })
  }

  /**
   * 刷新消息
   * @param  {[type]} $shortMessageBox [description]
   * @param  {[type]} $messageBox      [description]
   * @param  {[type]} messages         消息数组
   * @param  {[type]} today            今天的字符串，格式：yyyy-MM-dd
   * @param  {[type]} @opt             配置
   * @return {[type]}                  [void]
   */
  function refreshMessage($shortMessageBox, $messageBox, messages, today, opt) {
    // 更新搜索栏消息条数
    $shortMessageBox.find('.shortmessagebox-queryplaceholder').text('搜索' + messages.length + '条消息');

    // 更新列表
    var $messagelist = $('<dl class="shortmessagebox-messagelist"></dl>');
    if (!$messageBox) {
      $messageBox = $shortMessageBox.find('.shortmessagebox-messagebox');
    }
    // 清空消息内容
    $messageBox.empty();
    $messageBox.append($messagelist);
    // 今天的日期字符串转化为Date
    var todate = convertStr2Date(today).getTime();
    // 分组日期标题
    var dateGroup = {};
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      var showTimeObj = getShowTimeObj(message.time, today, todate);
      var dateGroupTitle = showTimeObj.title;
      if (!dateGroup[dateGroupTitle]) { // 开始下一个时间分组
        if (i !== 0) {
          // 分组结束线
          $messageBox.append('<div class="shortmessagebox-separator__date"></div>');
          // 下一个分组
          $messagelist = $('<dl class="shortmessagebox-messagelist"></dl>');
          $messageBox.append($messagelist);
        }
        // 时间标题
        $messagelist.append('<dt class="shortmessagebox-messagedate">' + dateGroupTitle + '</dt>');
        dateGroup[dateGroupTitle] = true;
      } else { // 同一个分组
        // 同一组中的消息分割线
        $messagelist.append('<dd class="shortmessagebox-separator__message"></dd>');
      }
      // 消息
      var $messageItem = $('<dd class="shortmessagebox-messageitem">'
          + '<a class="shortmessagebox-messagea">'
            + '<img src="' + message.img + '" width="30" class="shortmessagebox-messageaimg">'
            + '<p class="shortmessagebox-messageatitle">' + message.title
              + '<span class="shortmessagebox-messageatime">' + showTimeObj.showTime + '</span>'
            + '</p>'
            + '<p class="shortmessagebox-messageacontent">' + message.content + '</p>'
          + '</a>'
        + '</dd>');
      $messagelist.append($messageItem);
      bindMessageClick($messageItem, opt.clickMessage, i, messages[i], messages);
    }
    // 分组结束线
    $messageBox.append('<div class="shortmessagebox-separator__date"></div>');
  }
}));