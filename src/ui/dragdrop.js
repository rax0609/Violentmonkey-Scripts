(function () {
  "use strict";

  window.w3AutoHelper = window.w3AutoHelper || {};

  window.w3AutoHelper.DragDrop = (function () {
    function makeElementDraggable(element) {
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
      let isDragging = false;
      let isToggleButton = element === toggleButton; // 判斷是否為圓形按鈕
      let startRect = null;
      let transformOrigin = { x: 0, y: 0 };

      element.addEventListener("mousedown", dragMouseDown);

      function dragMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        // 記錄元素原始位置和大小
        startRect = element.getBoundingClientRect();

        // 獲取鼠標初始位置
        pos3 = e.clientX;
        pos4 = e.clientY;

        // 計算鼠標與元素邊緣的偏移
        transformOrigin.x = pos3 - startRect.left;
        transformOrigin.y = pos4 - startRect.top;

        // 添加鼠標移動和鬆開事件
        document.addEventListener("mousemove", elementDrag, { passive: false });
        document.addEventListener("mouseup", closeDragElement);

        // 添加拖動時的視覺效果
        element.style.cursor = "grabbing";
        element.style.opacity = "0.95";
        element.style.transition = "none";
        element.style.willChange = "transform, left, top"; // 優化渲染性能
        isDragging = true;
      }

      function elementDrag(e) {
        if (!isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        // 計算位置差異
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // 獲取當前樣式值
        let currentTop = element.offsetTop;
        let currentLeft = element.offsetLeft;

        // 計算新位置
        let newTop = currentTop - pos2;
        let newLeft = currentLeft - pos1;

        // 針對圓形按鈕的特殊處理
        if (isToggleButton) {
          // 使用transform而不是直接修改top/left，提高性能
          const moveX = e.clientX - (startRect.left + transformOrigin.x);
          const moveY = e.clientY - (startRect.top + transformOrigin.y);

          // 通過transform移動按鈕，提供最佳性能
          element.style.transform = `translate(${moveX}px, ${moveY}px)`;

          // 存儲最終位置計算 (在拖曳結束時應用)
          newTop = currentTop + moveY;
          newLeft = currentLeft + moveX;
        } else {
          // 面板使用標準方式移動
          element.style.top = newTop + "px";
          element.style.left = newLeft + "px";
        }

        // 計算視窗邊界
        const rect = element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        // 存儲臨時位置信息
        element._tempPosition = {
          top: Math.max(0, Math.min(newTop, maxY)),
          left: Math.max(0, Math.min(newLeft, maxX)),
        };
      }

      function closeDragElement() {
        if (!isDragging) return;

        // 移除事件監聽器
        document.removeEventListener("mousemove", elementDrag);
        document.removeEventListener("mouseup", closeDragElement);

        // 應用最終位置 (特別是對圓形按鈕來說)
        if (isToggleButton && element._tempPosition) {
          // 重置transform，並套用計算好的最終位置
          element.style.transform = "";
          element.style.top = element._tempPosition.top + "px";
          element.style.left = element._tempPosition.left + "px";

          // 保存按鈕位置
          if (isControlPanelMinimized) {
            restoreButtonPosition = {
              top: element.style.top,
              left: element.style.left,
            };
            GM_setValue("restoreButtonPosition", restoreButtonPosition);
          }
        }

        // 恢復正常視覺效果
        element.style.cursor = isToggleButton ? "pointer" : "move";
        element.style.opacity = "1";
        element.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        element.style.willChange = "auto";
        isDragging = false;

        // 在拖曳結束時添加一點動畫效果增強用戶體驗
        if (isToggleButton) {
          element.style.transform = "scale(1.1)";
          setTimeout(() => {
            element.style.transform = "";
          }, 150);
        }

        element._tempPosition = null;
        startRect = null;
      }
    }

    function setupDragAndDrop(element, container) {
      let draggedItem = null;
      let initialX, initialY;
      let offsetX, offsetY;
      let isDragging = false;
      let placeholder = null;
      let initialIndex = -1;

      // 只有拖動手柄才能觸發拖動
      const dragHandle = element.querySelector(".drag-handle");

      dragHandle.addEventListener("mousedown", startDrag);

      function startDrag(e) {
        e.preventDefault();

        // 獲取初始位置
        draggedItem = element;
        initialX = e.clientX;
        initialY = e.clientY;

        // 計算偏移量
        const rect = draggedItem.getBoundingClientRect();
        offsetX = initialX - rect.left;
        offsetY = initialY - rect.top;

        // 記錄初始索引
        const groups = Array.from(container.querySelectorAll(".button-group"));
        initialIndex = groups.indexOf(draggedItem);

        // 創建佔位元素
        placeholder = document.createElement("div");
        placeholder.style.width = `${rect.width}px`;
        placeholder.style.height = `${rect.height}px`;
        placeholder.style.margin = "0";
        placeholder.style.padding = "0";
        placeholder.style.background = "rgba(255, 255, 255, 0.1)";
        placeholder.style.borderRadius = "16px";
        placeholder.style.border = "2px dashed rgba(255, 255, 255, 0.3)";
        placeholder.style.transition = "all 0.2s ease";
        placeholder.className = "drag-placeholder";

        // 添加拖動樣式
        draggedItem.classList.add("dragging");
        draggedItem.style.position = "absolute";
        draggedItem.style.zIndex = "1000";
        draggedItem.style.width = `${rect.width}px`;
        draggedItem.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.6)";
        isDragging = true;

        // 插入佔位元素
        container.insertBefore(placeholder, draggedItem);

        // 更新拖曳元素位置
        updateDraggedPosition(e);

        // 添加拖動事件監聽器
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", endDrag);
      }

      function drag(e) {
        if (!isDragging || !draggedItem) return;

        e.preventDefault();
        updateDraggedPosition(e);

        // 檢查是否需要重新排序
        const allGroups = Array.from(
          container.querySelectorAll(".button-group:not(.dragging)")
        );
        const closestGroup = findClosestElement(
          e.clientX,
          e.clientY,
          allGroups
        );

        if (closestGroup) {
          const rect = closestGroup.getBoundingClientRect();

          // 確定放置位置（前面或後面）
          if (e.clientX < rect.left + rect.width / 2) {
            container.insertBefore(placeholder, closestGroup);
          } else {
            container.insertBefore(placeholder, closestGroup.nextSibling);
          }
        }
      }

      function updateDraggedPosition(e) {
        if (!draggedItem) return;
        // 直接將元素位置設為滑鼠位置減去偏移
        draggedItem.style.left = `${e.clientX - offsetX}px`;
        draggedItem.style.top = `${e.clientY - offsetY}px`;
      }

      function endDrag(e) {
        if (draggedItem && placeholder) {
          // 將拖曳元素放置到佔位元素的位置
          container.insertBefore(draggedItem, placeholder);
          container.removeChild(placeholder);

          // 移除拖動樣式
          draggedItem.classList.remove("dragging");
          draggedItem.style.position = "";
          draggedItem.style.top = "";
          draggedItem.style.left = "";
          draggedItem.style.zIndex = "";
          draggedItem.style.width = "";
          draggedItem.style.boxShadow = "";

          // 添加放置動畫效果
          draggedItem.style.transform = "scale(1.05)";
          setTimeout(() => {
            draggedItem.style.transform = "";
          }, 200);

          // 保存新的按鈕順序
          saveButtonOrder();

          // 檢查是否有實際移動
          const groups = Array.from(
            container.querySelectorAll(".button-group")
          );
          const finalIndex = groups.indexOf(draggedItem);

          if (initialIndex !== finalIndex) {
            // 播放移動音效或其他反饋
            draggedItem.style.animation = "pulse 0.5s ease";
            setTimeout(() => {
              draggedItem.style.animation = "";
            }, 500);
          }

          draggedItem = null;
          placeholder = null;
          isDragging = false;
        }

        // 移除事件監聽器
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", endDrag);
      }

      // 找到最接近的元素
      function findClosestElement(x, y, elements) {
        let closest = null;
        let minDistance = Number.MAX_VALUE;

        elements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // 使用二維距離計算
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );

          if (distance < minDistance) {
            minDistance = distance;
            closest = element;
          }
        });

        return closest;
      }

      // 保存按鈕順序
      function saveButtonOrder() {
        const groups = Array.from(container.querySelectorAll(".button-group"));
        const newOrder = groups.map((group) => parseInt(group.dataset.index));

        // 過濾掉無效值
        const filteredOrder = newOrder.filter((index) => !isNaN(index));

        // 保存新順序
        buttonOrder = filteredOrder;
        GM_setValue("buttonOrder", buttonOrder);
      }
    }

    return {
      makeElementDraggable,
      setupDragAndDrop,
    };
  })();
})();
