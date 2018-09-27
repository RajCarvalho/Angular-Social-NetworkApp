
var app = angular.module('myApp', ["ngRoute"]);
var users = [];
var msgs = [];
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            template: "",
        })
        .when("/signup", {
            templateUrl: "signup.html"
        })
        .when("/login", {
            templateUrl: 'login.html',
            controller: 'logincontroller'
        })
        .when("/profile", {
            templateUrl: 'profile.html',
            controller: 'profilecontroller',
            resolve:['authService',function(authService){
                return authService.checkUserState();
            }]
        })
        .when("/home", {
            templateUrl: 'home.html',
            resolve:['authService',function(authService){
                return authService.checkUserState();
            }]
        })
        .when("/messages",{
            templateUrl:'messages.html',
            controller:'messagetransfer',
            resolve:['authService',function(authService){
                return authService.checkUserState();
            }]
        })
        .when("/msgdetails",{
            templateUrl:"msgdetails.html",
           controller:"msgdetails",
            resolve:['authService',function(authService){
                return authService.checkUserState();
            }]
        })
        .otherwise({ redirectTo: '/login' });
}]);
app.controller('firstpage', function ($scope, $location, $rootScope) {
    $rootScope.status = false;
    if (localStorage.isLoggedIn) {
        localStorage.isLoggedIn = true;
        $rootScope.status = true;
    }

    $scope.logout = function () {
        if ($rootScope.status) {
            $rootScope.status = false;
        }
        localStorage.removeItem("isLoggedIn");
        $location.path("/login");
    }
});

app.controller('profilecontroller', function ($scope){
    if(localStorage.username){
        $scope.users = JSON.parse(localStorage.all_users);
        for(var i=0; i<$scope.users.length; i++){
            if($scope.users[i].username == localStorage.username){
                $scope.profile = $scope.users[i];
            }
        }
        $scope.update = function(){
            //alert($scope.profile.username + " " + $scope.profile.password + " "+ $scope.profile.fname + " "+ $scope.profile.lname)
            for (var i = 0; i < $scope.users.length; i++) {
                if($scope.users[i].username == localStorage.username){  
                    $scope.users[i].username = $scope.profile.username;
                    $scope.users[i].password = $scope.profile.password;
                    $scope.users[i].fname = $scope.profile.fname;
                    $scope.users[i].lname = $scope.profile.lname;
                    $scope.users[i].email = $scope.profile.email;
                    $scope.users[i].phone = $scope.profile.phone;
                    $scope.users[i].location = $scope.profile.location;
                    break;
                }
            }
            localStorage.setItem("all_users", JSON.stringify( $scope.users));
            alert("Profile Updated.")
        }
        
    }
    
});
app.controller('signupcontoller', function ($scope, $location) {
    $scope.save = function () {
        if (localStorage.all_users) {
            users = JSON.parse(localStorage.all_users)
        }
        var exist = verifyUser($scope.username, $scope.password, 'signup');
        if (exist) {
            alert('User already exist');
            return;
        } else {
            var userdetails = {
                "username": $scope.username,
                "password": $scope.password,
                "fname": $scope.fname,
                "lname": $scope.lname,
                "email": $scope.email,
                "phone": $scope.phone,
                "location": $scope.location
            }
            users.push(userdetails);
            localStorage.all_users = JSON.stringify(users);
            $location.path('/login')
        }
    }

});
app.controller('logincontroller', function ($scope, $location, $rootScope) {
    $scope.login = function () {
        if ($scope.username == '' || $scope.password == '') {
            alert('Please enter username and password.')
        }
        else {
            var verify = verifyUser($scope.username, $scope.password, 'login');
            if (verify) {
                localStorage.isLoggedIn = true;
                $rootScope.status = true;
                $location.path('/home');
            }
            else {
                alert('Invalid username and password');
                return;
            }
        }
    }
});
app.controller('logsignup', function ($scope, $location) {
    $scope.loginclick = function () {
        $location.path('/login');
    };
    $scope.signupclick = function () {
        $location.path('/signup');
    }
});
function verifyUser(username, password, mode) {
    if (localStorage.all_users) {
        users = JSON.parse(localStorage.all_users)
    }
    if (mode == 'login') {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username == username && users[i].password == password) {
                localStorage.username = users[i].username;
                return true;
            }
        }
        return false;
    }
    else {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username == username) {
                return true;
            }
        }
        return false;
    }
}
app.factory('authService',function($location,$http,$q){
    return {
        'checkUserState':function(){
            var defer = $q.defer();
            if(localStorage.isLoggedIn){
                defer.resolve();
            }
            else{
                $location.path('/login');
                defer.reject();
            }
            return defer.promise;
        }

    };
})
app.controller('messagetransfer',function($scope,$location,$rootScope){
    $scope.msgs = [];
    $scope.myindex = [];
    $rootScope.messageID;

    if(localStorage.all_msgs){
        var messages_all = JSON.parse(localStorage.all_msgs);
        for(let i = 0; i < messages_all.length;i++){
            if(messages_all[i].sender == localStorage.username || messages_all[i].recepient == localStorage.username ){
                $scope.myindex.push(i);
                $scope.msgs.push(messages_all[i]);
            }
        }
    }
    $scope.send = function(){
        var msg = [];
        if(localStorage.all_msgs){
           var msg = JSON.parse(localStorage.all_msgs);
        }
        var msgdetails = {
            "sender":localStorage.username,
            "recepient":$scope.receipient,
            "title":$scope.title,
            "description":$scope.msg,
            "time": new Date(),
            "important":"false",
            "replies":[]
        }
        msg.push(msgdetails);
        $scope.msgs.push(msgdetails);
        localStorage.all_msgs = JSON.stringify(msg);
         alert("Message sent.")
         $scope.receipient="";
         $scope.title="";
         $scope.msg="";
    };
    $scope.GetDetails = function (index) {
        $rootScope.messageID = $scope.myindex[index];
        $location.path('/msgdetails');
        $rootScope.mreceipient = $scope.msgs[index].recepient;
        $rootScope.mtitle = $scope.msgs[index].title;
        $rootScope.description = $scope.msgs[index].description;
        $rootScope.time = $scope.msgs[index].time;
        
        $scope.msgs = JSON.parse(localStorage.all_msgs);        
    }; 
});
app.controller("msgdetails",function($scope,$location,$rootScope){
 $scope.allreply=[];
    if(localStorage.all_msgs){
        $scope.msgs = JSON.parse(localStorage.all_msgs);
        if($scope.msgs[$rootScope.messageID] != undefined){
            $scope.allreply = $scope.msgs[$rootScope.messageID].replies;
        }
        if ($scope.msgs[$rootScope.messageID] != undefined && $scope.msgs[$rootScope.messageID].important == "true"){
            $scope.isDisabled = true;
        }
    }
    $scope.back = function(){
        $location.path('/messages')
    }
    $scope.delete = function(){
        if(localStorage.all_msgs){
            $scope.msgs = JSON.parse(localStorage.all_msgs);
            $scope.msgs.splice( $rootScope.messageID, 1 );
            localStorage.all_msgs = JSON.stringify($scope.msgs);
            $location.path('/messages');
        }
        
    }
    $scope.important = function(){
        if(localStorage.all_msgs){
            msgs = JSON.parse(localStorage.all_msgs);
            msgs[$rootScope.messageID].important = "true";
            localStorage.all_msgs = JSON.stringify(msgs);
            $scope.isDisabled = true;            
        }
    }
    $scope.sendResponse = function(){
        if(localStorage.all_msgs){
            $scope.msgs = JSON.parse(localStorage.all_msgs);           
            var replymsg = {
                "sender":localStorage.username,
                "time":new Date(),
                "msg":$scope.reply
            }
            $scope.allreply.push(replymsg);
            if($scope.msgs[$rootScope.messageID] != undefined){
                $scope.msgs[$rootScope.messageID].replies = $scope.allreply;
            }
            localStorage.all_msgs = JSON.stringify($scope.msgs);
            $scope.reply = '';    
        }
    }
})