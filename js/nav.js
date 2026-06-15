// 导航菜单交互功能
 document.addEventListener('DOMContentLoaded', function() {
   // 获取菜单按钮和导航菜单元素
   const menuToggle = document.getElementById('menu-toggle');
   const navMenu = document.getElementById('nav-menu');
   
   // 检查元素是否存在
   if (menuToggle && navMenu) {
     // 菜单按钮点击事件
     menuToggle.addEventListener('click', function() {
       // 切换菜单按钮的active类
       this.classList.toggle('active');
       // 切换导航菜单的show类
       navMenu.classList.toggle('show');
     });
     
     // 点击页面其他地方关闭菜单
     document.addEventListener('click', function(event) {
       // 如果点击的不是菜单按钮或导航菜单
       if (!menuToggle.contains(event.target) && !navMenu.contains(event.target)) {
         // 移除菜单按钮的active类
         menuToggle.classList.remove('active');
         // 移除导航菜单的show类
         navMenu.classList.remove('show');
       }
     });
   }
 });