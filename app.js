window.addEventListener('load', () => {

    // DOM要素の取得
    const yAxisTopInput = document.getElementById('y-axis-top');
    const yAxisBottomInput = document.getElementById('y-axis-bottom');
    const xAxisLeftInput = document.getElementById('x-axis-left');
    const xAxisRightInput = document.getElementById('x-axis-right');

    const yAxisTopLabel = document.getElementById('y-axis-top-label');
    const yAxisBottomLabel = document.getElementById('y-axis-bottom-label');
    const xAxisLeftLabel = document.getElementById('x-axis-left-label');
    const xAxisRightLabel = document.getElementById('x-axis-right-label');

    const stagingArea = document.getElementById('staging-area');
    const fileUpload = document.getElementById('file-upload');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const sortingGrid = document.getElementById('sorting-grid');

    // --- 軸ラベルの動的更新 ---
    yAxisTopInput.addEventListener('input', (e) => {
        yAxisTopLabel.textContent = e.target.value || 'Y軸 (上)';
    });

    yAxisBottomInput.addEventListener('input', (e) => {
        yAxisBottomLabel.textContent = e.target.value || 'Y軸 (下)';
    });

    xAxisLeftInput.addEventListener('input', (e) => {
        xAxisLeftLabel.textContent = e.target.value || 'X軸 (左)';
    });

    xAxisRightInput.addEventListener('input', (e) => {
        xAxisRightLabel.textContent = e.target.value || 'X軸 (右)';
    });

    // --- グリッドの生成 ---
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.cellId = i;
        sortingGrid.appendChild(cell);
    }

    // --- ファイルアップロードエリアのクリックイベント ---
    stagingArea.addEventListener('click', () => {
        fileUpload.click();
    });

    fileUpload.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // --- ファイル処理とサムネイル表示 ---
    function handleFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.draggable = true;
                img.dataset.imageId = `img-${Date.now()}`;
                // dragstartイベントは画像自体に設定
                img.addEventListener('dragstart', handleDragStart);
                thumbnailPreview.appendChild(img);
            }
            reader.readAsDataURL(file);
        }
    }

    let draggedElement = null; // ドラッグ中の要素を保持

    function handleDragStart(e) {
        draggedElement = e.target; // ドラッグされた画像要素を保存
        e.dataTransfer.setData('text/plain', e.target.dataset.imageId);
        // ドラッグ中の見た目を調整
        setTimeout(() => {
            draggedElement.classList.add('dragging');
        }, 0);
    }

    // ドラッグ終了時の処理（ドロップ成功・失敗問わず）
    document.addEventListener('dragend', () => {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    });

    // --- イベントデリゲーションを使用してコンテナ全体でイベントを処理 ---
    const workspace = document.querySelector('.workspace');

    workspace.addEventListener('dragover', (e) => {
        e.preventDefault(); // ドロップを許可するために必須
        const targetCell = getDropTargetCell(e.target);
        if (targetCell) {
            // すべてのセルのハイライトを一旦解除
            document.querySelectorAll('.dragover').forEach(el => el.classList.remove('dragover'));
            targetCell.classList.add('dragover');
        }
    });

    workspace.addEventListener('dragleave', (e) => {
        const targetCell = getDropTargetCell(e.target);
        if (targetCell) {
            targetCell.classList.remove('dragover');
        }
    });

    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        document.querySelectorAll('.dragover').forEach(el => el.classList.remove('dragover'));

        if (!draggedElement) return;

        const dropTarget = getDropTarget(e.target);

        if (!dropTarget) return;

        const sourceParent = draggedElement.parentElement;
        const targetElement = dropTarget.firstElementChild;

        // 自分自身へのドロップは無視
        if (sourceParent === dropTarget) return;

        // ドロップ先がステージングエリアの場合
        if (dropTarget.id === 'thumbnail-preview') {
            dropTarget.appendChild(draggedElement);
            return;
        }

        // ドロップ先がグリッドセルの場合
        if (dropTarget.classList.contains('grid-cell')) {
            // ドロップ先に既に画像がある場合（スワップ）
            if (targetElement) {
                sourceParent.appendChild(targetElement);
            }
            dropTarget.appendChild(draggedElement);
        }
    });

    // ドロップ先のセルまたはステージングエリアを取得するヘルパー関数
    function getDropTarget(element) {
        if (element.classList.contains('grid-cell') || element.id === 'thumbnail-preview') {
            return element;
        }
        // 画像の上にドロップされた場合は、親のセル/エリアを返す
        return element.closest('.grid-cell, #thumbnail-preview');
    }
    
    // dragover/dragleave用のヘルパー関数
    function getDropTargetCell(element) {
        return element.closest('.grid-cell, #thumbnail-preview');
    }

    // ファイルドロップ用のリスナーをステージングエリアに別途設定
    stagingArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    });
});