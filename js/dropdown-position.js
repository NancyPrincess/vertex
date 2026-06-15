// 菜单交互功能
function initMenuInteraction() {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (!menuBtn || !dropdownMenu) return;

    // 菜单按钮点击事件
    menuBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
        // 菜单显示时重新定位
        setTimeout(positionDropdownMenu, 10);
    });

    // 点击页面其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });
}

// 确保下拉菜单始终在body最右侧
function positionDropdownMenu() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (!dropdownMenu) return;

    // 获取body的宽度
    const bodyWidth = document.body.clientWidth;
    // 获取下拉菜单的宽度
    const menuWidth = dropdownMenu.offsetWidth;
    // 计算右边距
    const rightPosition = 0.06; // 可以根据需要调整右边距

    // 设置下拉菜单的位置
    dropdownMenu.style.position = 'absolute';
    dropdownMenu.style.right = rightPosition + 'rem';
    // 可以根据需要设置top位置
    // dropdownMenu.style.top = '50px';
}

// 初始化所有功能
function initDropdownMenu() {
    initMenuInteraction();
    positionDropdownMenu();
}

// 页面加载完成后初始化
window.addEventListener('load', initDropdownMenu);
// 监听窗口大小变化
window.addEventListener('resize', positionDropdownMenu);