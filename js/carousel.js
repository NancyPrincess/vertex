// 原生JavaScript无缝无限轮播实现 (优化版)
class Carousel {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.wrapper = this.container.querySelector('.swiper-wrapper');
    this.slides = this.container.querySelectorAll('.swiper-slide');
    
    // 检查是否有幻灯片，如果没有则不继续初始化
    if (!this.slides || this.slides.length === 0) {
      console.error('Carousel: No slides found with selector .swiper-slide');
      return;
    }
    
    this.pagination = this.container.querySelector('.swiper-pagination');
    this.prevBtn = this.container.querySelector('.swiper-button-prev');
    this.nextBtn = this.container.querySelector('.swiper-button-next');

    // 配置选项
    this.config = {
      threshold: options.threshold || 50, // 触发翻页的最小移动距离
      transitionDuration: options.transitionDuration || 300, // 过渡动画时长(ms)
      easeFunction: options.easeFunction || 'ease', // 缓动函数
      loop: options.loop !== undefined ? options.loop : true, // 是否循环
    };

    this.currentIndex = 1; // 从复制的第一张开始
    this.isTransitioning = false;
    this.isDragging = false;
    this.startX = 0;
    this.moveX = 0;
    this.startTime = 0;
    this.velocity = 0;

    // 初始化幻灯片宽度和数量
    this.init();
  }

  init() {
    // 复制首尾幻灯片实现无缝滚动
    this.duplicateSlides();
    // 更新 slides 和 totalSlides
    this.slides = this.container.querySelectorAll('.swiper-slide');
    this.totalSlides = this.slides.length;
    
    // 确保幻灯片存在后再获取宽度
    if (this.slides.length > 0) {
      this.slideWidth = this.slides[0].offsetWidth;
    } else {
      console.error('Carousel: No slides available after duplication');
      return;
    }

    // 设置wrapper宽度
    this.wrapper.style.width = `${this.totalSlides * 100}%`;
    // 设置每个slide的宽度
    this.slides.forEach(slide => {
      slide.style.width = `${100 / this.totalSlides}%`;
    });

    // 创建分页器
    this.createPagination();

    // 添加事件监听
    this.addEventListeners();

    // 初始位置设置为第一张真实幻灯片
    this.wrapper.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;

    // 移除自动播放功能
  }

  duplicateSlides() {
    // 复制最后一张幻灯片到开头
    const lastSlide = this.slides[this.slides.length - 1].cloneNode(true);
    lastSlide.classList.add('clone');
    this.wrapper.insertBefore(lastSlide, this.slides[0]);

    // 复制第一张幻灯片到末尾
    const firstSlide = this.slides[0].cloneNode(true);
    firstSlide.classList.add('clone');
    this.wrapper.appendChild(firstSlide);
  }

  createPagination() {
    if (!this.pagination) return;

    this.pagination.innerHTML = '';
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('span');
      dot.classList.add('swiper-pagination-bullet');
      if (i === this.currentIndex) {
        dot.classList.add('active');
      }
      dot.addEventListener('click', () => this.goToSlide(i));
      this.pagination.appendChild(dot);
    }
  }

  addEventListeners() {
    // 前一张按钮
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }

    // 后一张按钮
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // 窗口大小变化时重新计算
    window.addEventListener('resize', () => {
      // 确保幻灯片存在后再获取宽度
      if (this.slides && this.slides.length > 0) {
        this.slideWidth = this.slides[0].offsetWidth;
        this.goToSlide(this.currentIndex);
      }
    });

    // 鼠标滑动事件
    this.container.addEventListener('mousedown', (e) => this.handleDown(e));
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseup', () => this.handleUp());

    // 触摸滑动事件 (移动设备支持)
    this.container.addEventListener('touchstart', (e) => this.handleDown(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    document.addEventListener('touchend', () => this.handleUp());
  }

  // 处理按下事件 (鼠标和触摸通用)
  handleDown(e) {
    if (this.isTransitioning) return;
    this.isDragging = true;
    this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.startTime = Date.now();
    this.moveX = 0;
    this.wrapper.style.transition = 'none';
  }

  // 处理移动事件 (鼠标和触摸通用)
  handleMove(e) {
    if (!this.isDragging) return;
    
    // 防止触摸事件导致页面滚动
    if (e.type === 'touchmove') {
      e.preventDefault();
    }

    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    this.moveX = currentX - this.startX;

    // 计算当前位置并应用位移
    const currentPosition = -this.currentIndex * this.slideWidth + this.moveX;
    this.wrapper.style.transform = `translateX(${currentPosition}px)`;
  }

  // 处理释放事件 (鼠标和触摸通用)
  handleUp() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // 计算滑动速度
    const duration = Date.now() - this.startTime;
    this.velocity = Math.abs(this.moveX) / duration; // 像素/毫秒

    // 设置过渡效果
    this.wrapper.style.transition = `transform ${this.config.transitionDuration}ms ${this.config.easeFunction}`;

    // 根据移动距离和速度判断是否翻页
    const shouldChangeSlide = Math.abs(this.moveX) >= this.config.threshold || this.velocity > 0.5;

    if (shouldChangeSlide) {
      if (this.moveX > 0) {
        // 向右移动，上一张
        this.prevSlide();
      } else {
        // 向左移动，下一张
        this.nextSlide();
      }
    } else {
      // 移动距离不足，回到原位置
      this.goToSlide(this.currentIndex);
    }

    this.moveX = 0;
  }

  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;

    this.isTransitioning = true;
    this.currentIndex = index;

    // 更新wrapper位置
    this.wrapper.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
    this.wrapper.style.transition = `transform ${this.config.transitionDuration}ms ${this.config.easeFunction}`;

    // 更新分页器状态
    this.updatePagination();

    // 检测是否到达克隆的幻灯片
    setTimeout(() => {
      if (this.config.loop) {
        if (this.currentIndex === 0) {
          // 如果是第一张克隆幻灯片，无缝跳转到最后一张真实幻灯片
          this.currentIndex = this.totalSlides - 2;
          this.wrapper.style.transition = 'none';
          this.wrapper.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
        } else if (this.currentIndex === this.totalSlides - 1) {
          // 如果是最后一张克隆幻灯片，无缝跳转到第一张真实幻灯片
          this.currentIndex = 1;
          this.wrapper.style.transition = 'none';
          this.wrapper.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
        }
      }
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  prevSlide() {
    if (this.isTransitioning) return;

    if (this.config.loop) {
      const index = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
      this.goToSlide(index);
    } else if (this.currentIndex > 1) {
      // 如果没有启用循环且不是第一张幻灯片
      this.goToSlide(this.currentIndex - 1);
    }
  }

  nextSlide() {
    if (this.isTransitioning) return;

    if (this.config.loop) {
      const index = (this.currentIndex + 1) % this.totalSlides;
      this.goToSlide(index);
    } else if (this.currentIndex < this.totalSlides - 2) {
      // 如果没有启用循环且不是最后一张幻灯片
      this.goToSlide(this.currentIndex + 1);
    }
  }

  updatePagination() {
    if (!this.pagination) return;

    const bullets = this.pagination.querySelectorAll('.swiper-pagination-bullet');
    // 计算真实索引（排除克隆的幻灯片）
    let realIndex = this.currentIndex - 1;
    if (realIndex < 0) realIndex = bullets.length - 1;
    if (realIndex >= bullets.length) realIndex = 0;

    bullets.forEach((bullet, index) => {
      if (index === realIndex) {
        bullet.classList.add('active');
      } else {
        bullet.classList.remove('active');
      }
    });
  }

  startAutoplay() {
    if (this.autoplayInterval) return;

    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

// 页面加载完成后初始化轮播
document.addEventListener('DOMContentLoaded', function() {
  // 检查页面上是否有轮播容器
  const carouselContainer = document.querySelector('.swiper-container');
  if (carouselContainer) {
    // 检查容器内是否有幻灯片
    const slides = carouselContainer.querySelectorAll('.swiper-slide');
    if (slides.length > 0) {
      // 初始化轮播，可传入配置选项
      const carousel = new Carousel('.swiper-container', {
        threshold: 50, // 触发翻页的最小移动距离
        transitionDuration: 300, // 过渡动画时长(ms)
        easeFunction: 'ease-out', // 缓动函数
        loop: true // 是否启用循环
      });
    }
  }
});