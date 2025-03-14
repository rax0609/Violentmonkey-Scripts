// ==UserScript==
// @name         W3Schools 自動滾動到底部並跳轉下一頁
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自動滾動到W3Schools頁面底部，顯示美化的跳轉提示，然後跳轉到下一頁
// @author       @
// @match        https://www.w3schools.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 設定延遲執行時間（毫秒）
    const INITIAL_DELAY = 1500;  // 頁面載入後等待1.5秒
    const SCROLL_DELAY = 2000;   // 滾動後等待2秒再顯示提示
    const NOTIFICATION_DURATION = 500; // 提示顯示時間（0.5秒）

    // 添加CSS樣式到頁面
    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .auto-next-notification {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #4CAF50, #2196F3);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                font-weight: 500;
                z-index: 9999;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.2s ease, transform 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .auto-next-notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .auto-next-notification-icon {
                display: inline-block;
                width: 24px;
                height: 24px;
                border: 2px solid white;
                border-radius: 50%;
                position: relative;
            }
            
            .auto-next-notification-icon::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 8px;
                border-top: 2px solid white;
                border-right: 2px solid white;
                transform: translate(-75%, -50%) rotate(45deg);
            }
        `;
        document.head.appendChild(styleElement);
    }

    // 創建並顯示跳轉提示
    function showNotification(nextPageTitle) {
        // 創建提示元素
        const notification = document.createElement('div');
        notification.className = 'auto-next-notification';
        
        // 設置提示內容
        notification.innerHTML = `
            <span class="auto-next-notification-icon"></span>
            <span>正在跳轉到: ${nextPageTitle || '下一頁'}</span>
        `;
        
        // 添加到頁面
        document.body.appendChild(notification);
        
        // 觸發動畫
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 設定提示顯示時間
        return notification;
    }

    // 獲取下一頁標題
    function getNextPageTitle(url) {
        // 從URL中提取頁面名稱
        const pageName = url.split('/').pop().replace('.asp', '').replace(/_/g, ' ');
        
        // 將頁面名稱轉換為標題格式
        return pageName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // 主要執行函數
    function main() {
        console.log('W3Schools自動滾動並跳轉腳本已啟動');
        
        // 添加樣式
        addStyles();
        
        // 等待頁面完全載入
        setTimeout(function() {
            // 尋找 w3-clear nextprev 容器內的 w3-right w3-btn 按鈕
            const nextButton = document.querySelector('.w3-clear.nextprev a.w3-right.w3-btn');
            
            if (nextButton && nextButton.href) {
                console.log('找到Next按鈕，準備滾動頁面');
                const nextPageUrl = nextButton.href;
                const nextPageTitle = getNextPageTitle(nextPageUrl);
                
                // 滾動到頁面底部
                scrollToBottom();
                
                // 滾動後等待一段時間再顯示提示並跳轉
                setTimeout(function() {
                    // 顯示跳轉提示
                    const notification = showNotification(nextPageTitle);
                    
                    // 提示顯示一段時間後跳轉
                    setTimeout(function() {
                        console.log('跳轉到下一頁：', nextPageUrl);
                        window.location.href = nextPageUrl;
                    }, NOTIFICATION_DURATION);
                }, SCROLL_DELAY);
            } else {
                console.log('未找到符合條件的Next按鈕或按鈕沒有href屬性');
            }
        }, INITIAL_DELAY);
    }

    // 滾動到頁面底部的函數
    function scrollToBottom() {
        // 平滑滾動到頁面底部
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        
        console.log('已滾動到頁面底部');
    }

    // 執行主函數
    main();
})();
