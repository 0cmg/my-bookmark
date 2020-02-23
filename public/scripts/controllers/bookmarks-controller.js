app.controller('bookmarksCtr', ['$scope', '$state', '$stateParams', '$filter', '$window', '$timeout', '$document', 'bookmarkService', 'pubSubService', 'dataService', function ($scope, $state, $stateParams, $filter, $window, $timeout, $document, bookmarkService, pubSubService, dataService) {
    console.log("Hello bookmarksCtr...", $stateParams);
    if (dataService.smallDevice()) {
        $window.location = "http://m.mybookmark.cn/#/tags";
        return;
    }

    $scope.bookmarks = []; // 书签数据
    $scope.showSearch = false; // 搜索对话框
    $scope.bookmarkNormalHover = false;
    $scope.bookmarkEditHover = false;
    $scope.hoverBookmark = null;
    $scope.showStyle = 'navigate';
    const perPageItems = 20;
    $scope.totalPages = 0;
    $scope.currentPage = 1;
    $scope.inputPage = '';
    $scope.loadBusy = false;
    $scope.waitDelBookmark = {};
    $scope.order = [false, false, false];
    $scope.order[($stateParams && $stateParams.orderIndex) || 0] = true;
    $scope.bookmarkData = {};

    var menusScope = $('div[ng-controller="menuCtr"]').scope();
    var login = (menusScope && menusScope.login) || false;
    pubSubService.publish('Common.menuActive', {
        login: login,
        index: login ? dataService.LoginIndexBookmarks : dataService.NotLoginIndexBookmarks
    });

    getBookmarks();

    $scope.jumpToUrl = function (url, id) {
        $window.open(url, '_blank');
        bookmarkService.clickBookmark({
            id: id
        });
    }

    $scope.detailBookmark = function (b) {
        var bookmark = $.extend(true, {}, b); // 利用jQuery执行深度拷贝
        bookmark.own = true;
        if ($scope.showStyle == 'navigate') {
            bookmark.tags = [{
                id: bookmark.tag_id,
                name: bookmark.tag_name
            }];
        }
        pubSubService.publish('TagCtr.showBookmarkInfo', bookmark);
        bookmarkService.clickBookmark({
            id: bookmark.id
        });
    }

    $scope.copy = function (url) {
        dataService.clipboard(url);
    }

    $scope.jumpToTags = function (tagId) {
        // $state.go('tags', {
        //     tagId: tagId,
        // })
    }

    $scope.closeMsg = function () {
        $('.js-msg').transition({
            animation: dataService.animation(),
            duration: '500ms',
            onComplete: function () {
                $(".js-msg").remove();
            }
        });
    }

    $scope.setHoverBookmark = function (bookmark) {
        $scope.hoverBookmark = bookmark;
    }

    // 在输入文字的时候也会触发，所以不要用Ctrl,Shift之类的按键
    $document.bind("keydown", function (event) {
        $scope.$apply(function () {
            var key = event.key.toUpperCase();
            console.log(key);
            if ($scope.hoverBookmark && dataService.keyShortcuts()) {
                if (key == 'E') {
                    // $scope.editBookmark($scope.hoverBookmark.id)
                } else if (key == 'I') {
                    // $scope.detailBookmark($scope.hoverBookmark)
                } else if (key == 'D') {
                    // $scope.delBookmark($scope.hoverBookmark)
                } else if (key == 'C') {
                    $scope.copy($scope.hoverBookmark.url)
                }
            }
        })
    });

    function getBookmarks() {
        var params = {}
        params.showStyle = 'navigate';
        params.currentPage = $scope.currentPage;
        params.perPageItems = perPageItems;

        $scope.loadBusy = true;
        bookmarkService.getBookmarks(params)
            .then((data) => {
                $scope.bookmarks = data;
                if ($scope.bookmarks.length <= 2) {
                    $(".js-msg").removeClass("hidden");
                }
                if ($scope.bookmarks.length == 0) {
                    toastr.info('您还没有书签，请点击菜单栏的添加按钮进行添加', "提示");
                }
                $scope.loadBusy = false;
            })
            .catch((err) => {
                dataService.netErrorHandle(err, $state);
                $scope.loadBusy = false;
            });

    }
}]);
