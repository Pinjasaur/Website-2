(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";function update(){var t=new XDate;document.getElementById("weeks").innerHTML=Math.floor(t.diffWeeks(targetDate)).toString(),document.getElementById("days").innerHTML=Math.floor(t.diffDays(targetDate)%7).toString(),document.getElementById("hours").innerHTML=Math.floor(t.diffHours(targetDate)%24).toString(),document.getElementById("minutes").innerHTML=Math.floor(t.diffMinutes(targetDate)%60).toString(),document.getElementById("seconds").innerHTML=Math.floor(t.diffSeconds(targetDate)%60).toString()}var targetDate=new XDate(2016,11,30);window.onload=function(){update(),setInterval(update,100)},document.ontouchstart=function(t){t.preventDefault()},document.ontouchmove=function(t){t.preventDefault()};

},{}]},{},[1]);