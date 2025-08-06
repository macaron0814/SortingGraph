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

    // --- ドラッグ＆ドロップのイベントリスナー ---
    // ドラッグオーバー
    stagingArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        stagingArea.classList.add('dragover');
    });

    // ドラッグリーブ
    stagingArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        stagingArea.classList.remove('dragover');
    });

    // ドロップ
    stagingArea.addEventListener('drop', (e) => {
        e.preventDefault();
        stagingArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
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
                img.addEventListener('dragstart', handleDragStart);
                thumbnailPreview.appendChild(img);
            }
            reader.readAsDataURL(file);
        }
    }

    // --- 画像のドラッグ開始 ---
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.imageId);
    }

    // --- グリッドセルへのドラッグ＆ドロップ ---
    const gridCells = document.querySelectorAll('.grid-cell');

    gridCells.forEach(cell => {
        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
            cell.classList.add('dragover');
        });

        cell.addEventListener('dragleave', (e) => {
            e.preventDefault();
            cell.classList.remove('dragover');
        });

        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            cell.classList.remove('dragover');
            const imageId = e.dataTransfer.getData('text/plain');
            const draggableElement = document.querySelector(`[data-image-id='${imageId}']`);
            
            // セルにすでに画像があれば、それをステージングエリアに戻す（または他のロジック）
            if (cell.firstChild) {
                thumbnailPreview.appendChild(cell.firstChild);
            }
            cell.appendChild(draggableElement);
        });
    });

    

});
