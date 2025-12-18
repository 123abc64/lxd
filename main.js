// 个人主页主JavaScript文件

// 初始化数据结构
function initializeData() {
    // 确保所有必要的localStorage项都存在
    const dataKeys = ['experiences', 'personalInfo', 'skills', 'messages'];
    
    dataKeys.forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify([]));
        }
    });
    
    // 为个人信息设置默认结构
    const personalInfo = JSON.parse(localStorage.getItem('personalInfo'));
    if (Array.isArray(personalInfo)) {
        // 如果是数组，说明数据结构有问题，重置为对象
        localStorage.setItem('personalInfo', JSON.stringify({}));
    }
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面初始化开始...');
    
    // 初始化数据结构
    initializeData();
    
    // 初始化后台管理入口
    initAdminEntry();
    
    // 加载所有数据 - 增加错误处理
    try {
        console.log('开始加载页面数据...');
        loadPhotos();
        loadExperiences();
        loadPersonalInfo();
        loadSkills();
        displayMessages();
        console.log('页面数据加载完成');
    } catch (loadError) {
        console.error('数据加载过程中出现错误:', loadError);
        
        // 尝试重新加载关键数据
        setTimeout(() => {
            try {
                loadExperiences();
                loadPersonalInfo();
            } catch (retryError) {
                console.error('重试加载数据失败:', retryError);
            }
        }, 1000);
    }
    
    // 初始化交互功能
    initNavbar();
    initForms();
    
    // 添加存储调试信息（仅在开发模式）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.addEventListener('storage', function(e) {
            console.log(`🔄 Storage变化: ${e.key}`, {
                oldValue: e.oldValue ? '数据已存在' : '无数据',
                newValue: e.newValue ? '新数据' : '数据已删除',
                url: e.url
            });
        });
    }
    
    console.log('页面初始化完成');
});

// 添加StorageEvent监听，实现数据实时同步 - 改进版本
window.addEventListener('storage', function(e) {
    console.log('检测到数据变化:', e.key, e.newValue);
    
    // 重新加载对应的数据
    switch(e.key) {
        case 'experiences':
            loadExperiences();
            break;
        case 'personalInfo':
            loadPersonalInfo();
            loadPhotos();
            break;
        case 'personalPhoto':
        case 'avatarPhoto':
        case 'aboutPhoto':
            // 个人照片变化时，重新加载照片和个人信息
            loadPhotos();
            loadPersonalInfo();
            break;
        case 'skills':
            loadSkills();
            break;
        case 'messages':
            displayMessages();
            break;
    }
});

// 加载照片 - 改进版本
function loadPhotos() {
    console.log('开始加载照片...');
    
    try {
        // 从localStorage获取照片数据
        const avatarPhoto = localStorage.getItem('avatarPhoto');
        const aboutPhoto = localStorage.getItem('aboutPhoto');
        const personalPhoto = localStorage.getItem('personalPhoto');
        
        // 清理旧的photos数组（如果存在），节省存储空间
        if (localStorage.getItem('photos')) {
            localStorage.removeItem('photos');
            console.log('已清理旧的photos数组，释放存储空间');
        }
        
        // 找到照片容器
        const heroPhotoContainer = document.querySelector('.hero-photo .photo-container');
        const aboutPhotoContainer = document.querySelector('.about-photo .photo-container');
        
        console.log('头像照片存在:', !!avatarPhoto, '关于我照片存在:', !!aboutPhoto, '旧个人照片存在:', !!personalPhoto);
        
        // 处理英雄区域头像
        if (heroPhotoContainer) {
            let photoHtml = '';
            
            if (avatarPhoto && avatarPhoto.startsWith('data:')) {
                // 使用专门的头像照片
                photoHtml = `
                    <img src="${avatarPhoto}" alt="个人头像" class="profile-photo" 
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; 
                         box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.3s ease;"
                         onmouseover="this.style.transform='scale(1.05)'" 
                         onmouseout="this.style.transform='scale(1)'">
                `;
            } else if (personalPhoto && personalPhoto.startsWith('data:')) {
                // 回退使用旧的个人照片
                photoHtml = `
                    <img src="${personalPhoto}" alt="个人照片" class="profile-photo" 
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
                         box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.3s ease;"
                         onmouseover="this.style.transform='scale(1.05)'" 
                         onmouseout="this.style.transform='scale(1)'">
                `;
            } else {
                // 显示默认占位符
                photoHtml = `
                    <div class="placeholder-photo" 
                         style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; 
                         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; 
                         color: white; font-size: 14px; font-weight: 500; cursor: pointer;
                         box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;"
                         onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 25px rgba(102, 126, 234, 0.4)'"
                         onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(102, 126, 234, 0.3)'"
                         onclick="window.open('./admin/index.html', '_blank')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.8;">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                    </div>
                `;
            }
            
            heroPhotoContainer.innerHTML = photoHtml;
        }
        
        // 处理关于我区域照片
        if (aboutPhotoContainer) {
            let photoHtml = '';
            
            if (aboutPhoto && aboutPhoto.startsWith('data:')) {
                // 使用专门的关于我照片
                photoHtml = `
                    <img src="${aboutPhoto}" alt="关于我照片" class="profile-photo" 
                         style="width: 100%; height: auto; object-fit: contain; border-radius: 12px;
                         box-shadow: 0 8px 30px rgba(0,0,0,0.12); transition: transform 0.3s ease;"
                         onmouseover="this.style.transform='scale(1.02)'" 
                         onmouseout="this.style.transform='scale(1)'">
                `;
            } else if (personalPhoto && personalPhoto.startsWith('data:')) {
                // 回退使用旧的个人照片
                photoHtml = `
                    <img src="${personalPhoto}" alt="个人照片" class="profile-photo" 
                         style="width: 100%; height: auto; object-fit: contain; border-radius: 12px;
                         box-shadow: 0 8px 30px rgba(0,0,0,0.12); transition: transform 0.3s ease;"
                         onmouseover="this.style.transform='scale(1.02)'" 
                         onmouseout="this.style.transform='scale(1)'">
                `;
            } else {
                // 显示默认占位符
                photoHtml = `
                    <div class="placeholder-photo" 
                         style="width: 100%; height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                         background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; 
                         color: #8b4513; font-size: 14px; font-weight: 500; cursor: pointer;
                         box-shadow: 0 8px 30px rgba(252, 182, 159, 0.3); transition: all 0.3s ease;"
                         onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 12px 40px rgba(252, 182, 159, 0.4)'"
                         onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 30px rgba(252, 182, 159, 0.3)'"
                         onclick="window.open('./admin/index.html', '_blank')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 10px;">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <div>点击添加照片</div>
                    </div>
                `;
            }
            
            aboutPhotoContainer.innerHTML = photoHtml;
        }
        
        console.log('照片加载完成');
    } catch (error) {
        console.error('加载照片失败:', error);
        
        // 错误时显示占位符
        const heroPhotoContainer = document.querySelector('.hero-photo .photo-container');
        const aboutPhotoContainer = document.querySelector('.about-photo .photo-container');
        const errorHtml = '<div class="placeholder-photo" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #ffe6e6; border-radius: 50%; color: #e53e3e; font-size: 12px;">加载失败</div>';
        
        if (heroPhotoContainer) heroPhotoContainer.innerHTML = errorHtml;
        if (aboutPhotoContainer) aboutPhotoContainer.innerHTML = errorHtml;
    }
}



// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}



// 加载经历
function loadExperiences() {
    // 从localStorage获取经历数据
    const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
    
    // 分离教育经历和工作经历
    const educationExperiences = experiences.filter(exp => exp.type === 'education');
    const workExperiences = experiences.filter(exp => exp.type === 'work');
    
    // 找到时间线容器
    const educationTimeline = document.getElementById('education-timeline');
    const workTimeline = document.getElementById('work-timeline');
    
    // 渲染教育经历
    if (educationTimeline) {
        if (educationExperiences.length === 0) {
            educationTimeline.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-medium);">暂无教育经历</p>';
        } else {
            educationTimeline.innerHTML = '';
            
            educationExperiences.forEach(exp => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                timelineItem.innerHTML = `
                    <div class="timeline-date">${exp.date}</div>
                    <div class="timeline-content">
                        <h3>${exp.title}</h3>
                        <div class="timeline-company">${exp.company}</div>
                        <ul>
                            ${exp.description.split(';').map(item => `<li>${item.trim()}</li>`).join('')}
                        </ul>
                    </div>
                `;
                
                educationTimeline.appendChild(timelineItem);
            });
        }
    }
    
    // 渲染工作经历
    if (workTimeline) {
        if (workExperiences.length === 0) {
            workTimeline.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-medium);">暂无工作经历</p>';
        } else {
            workTimeline.innerHTML = '';
            
            workExperiences.forEach(exp => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                timelineItem.innerHTML = `
                    <div class="timeline-date">${exp.date}</div>
                    <div class="timeline-content">
                        <h3>${exp.title}</h3>
                        <div class="timeline-company">${exp.company}</div>
                        <ul>
                            ${exp.description.split(';').map(item => `<li>${item.trim()}</li>`).join('')}
                        </ul>
                    </div>
                `;
                
                workTimeline.appendChild(timelineItem);
            });
        }
    }
}

// 初始化导航栏
function initNavbar() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            navbarToggle.classList.toggle('active');
        });
    }
    
    // 平滑滚动
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 关闭移动端菜单
                if (navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    navbarToggle.classList.remove('active');
                }
            }
        });
    });
    
    // 经历选项卡切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 加载个人信息
function loadPersonalInfo() {
    // 从localStorage获取个人信息数据
    const personalInfo = JSON.parse(localStorage.getItem('personalInfo')) || {};
    
    // 更新页面上的个人信息
    const heroTitleElement = document.querySelector('.hero-content h1');
    const aboutTextElements = document.querySelectorAll('.about-text p');
    const heroDescriptionElement = document.querySelector('.hero-text p');
    
    // 更新英雄区域标题
    if (heroTitleElement && personalInfo.name) {
        heroTitleElement.textContent = `我是${personalInfo.name}`;
    }
    
    // 更新英雄区域描述
    if (heroDescriptionElement && personalInfo.bio) {
        // 从富文本内容中提取纯文本
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = personalInfo.bio;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        heroDescriptionElement.textContent = plainText || '我是一名充满激情的开发者，专注于创造令人惊叹的数字体验';
    }
    
    // 更新关于我部分内容
    if (aboutTextElements.length > 0 && personalInfo.bio) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = personalInfo.bio;
        
        // 如果有分段，分别显示；否则显示在第一段
        if (tempDiv.children.length > 0) {
            Array.from(aboutTextElements).forEach((elem, index) => {
                if (tempDiv.children[index]) {
                    elem.innerHTML = tempDiv.children[index].outerHTML || tempDiv.children[index].textContent;
                }
            });
        } else {
            aboutTextElements[0].innerHTML = personalInfo.bio;
        }
    } else if (aboutTextElements.length > 0) {
        // 默认内容
        aboutTextElements[0].textContent = '我是一名热爱编程和设计的开发者，拥有丰富的项目经验和扎实的技术功底。';
        if (aboutTextElements.length > 1) {
            aboutTextElements[1].textContent = '我的技术栈包括HTML、CSS、JavaScript、React等前端技术，以及Python、Node.js等后端技术。';
        }
        if (aboutTextElements.length > 2) {
            aboutTextElements[2].textContent = '除了技术之外，我还喜欢摄影、旅行和阅读。这些爱好不仅丰富了我的生活，也为我的设计和开发工作带来了灵感。';
        }
    }
    
    // 更新联系信息
    updateContactInfo(personalInfo);
}

// 更新联系信息
function updateContactInfo(personalInfo) {
    // 找到联系信息容器
    const contactInfoContainer = document.querySelector('.contact-info');
    
    if (contactInfoContainer) {
        // 找到各个联系信息项
        const contactItems = contactInfoContainer.querySelectorAll('.contact-item');
        
        // 更新邮箱 - 通过更简单的方式查找
        contactItems.forEach(item => {
            const itemTitle = item.querySelector('.contact-details h3');
            const itemText = item.querySelector('.contact-details p');
            
            if (itemTitle && itemText) {
                const titleText = itemTitle.textContent.trim();
                
                switch(titleText) {
                    case '邮箱':
                        if (personalInfo.email) {
                            itemText.textContent = personalInfo.email;
                        }
                        break;
                    case '电话':
                        if (personalInfo.phone) {
                            itemText.textContent = personalInfo.phone;
                        }
                        break;
                    case '地址':
                        if (personalInfo.school) {
                            itemText.textContent = personalInfo.school;
                        }
                        break;
                }
            }
        });
        
        // 添加额外的联系信息项（QQ等）
        if (personalInfo.qq && !document.querySelector('.contact-item[data-info="qq"]')) {
            const qqItem = createContactItem('QQ', personalInfo.qq, 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
            qqItem.setAttribute('data-info', 'qq');
            contactInfoContainer.appendChild(qqItem);
        }
    }
}

// 创建联系信息项
function createContactItem(title, value, svgPath) {
    const contactItem = document.createElement('div');
    contactItem.className = 'contact-item';
    contactItem.setAttribute('data-info', title.toLowerCase());
    
    contactItem.innerHTML = `
        <div class="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${svgPath ? `<path d="${svgPath}"></path>` : '<circle cx="12" cy="12" r="10"></circle>'}
            </svg>
        </div>
        <div class="contact-details">
            <h3>${title}</h3>
            <p>${value}</p>
        </div>
    `;
    
    return contactItem;
}

// 加载技能
function loadSkills() {
    // 从localStorage获取技能数据
    const skills = JSON.parse(localStorage.getItem('skills')) || [];
    
    // 找到技能容器
    const skillsGrid = document.querySelector('.skills-grid');
    
    if (skillsGrid) {
        // 如果没有技能，显示默认技能
        if (skills.length === 0) {
            // 显示默认的静态技能
            const defaultSkills = [
                {
                    name: '前端开发',
                    level: 85,
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
                    description: 'HTML、CSS、JavaScript、React、Vue等前端技术'
                },
                {
                    name: '后端开发',
                    level: 75,
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
                    description: 'Python、Node.js、Express等后端技术'
                },
                {
                    name: 'UI/UX设计',
                    level: 70,
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
                    description: 'Figma、Photoshop等设计工具'
                }
            ];
            
            skillsGrid.innerHTML = '';
            defaultSkills.forEach(skill => {
                createSkillElement(skill, skillsGrid);
            });
            return;
        }
        
        // 渲染用户自定义技能列表
        skillsGrid.innerHTML = '';
        
        skills.forEach(skill => {
            const skillData = {
                name: skill.name,
                level: skill.level,
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7L12 12L22 7L12 2Z"></path><path d="M2 17L12 22L22 17"></path><path d="M2 12L12 17L22 12"></path></svg>',
                description: `熟练程度：${skill.level}%`
            };
            createSkillElement(skillData, skillsGrid);
        });
    }
}

// 创建技能元素
function createSkillElement(skill, container) {
    const skillElement = document.createElement('div');
    skillElement.className = 'skill-item';
    skillElement.innerHTML = `
        <div class="skill-icon">
            ${skill.icon}
        </div>
        <h3>${skill.name}</h3>
        <div class="skill-level-bar" style="background: linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${skill.level}%, var(--border-color) ${skill.level}%, var(--border-color) 100%); height: 8px; border-radius: 4px; margin: 10px 0;"></div>
        <p>${skill.description}</p>
        <div style="margin-top: 10px; font-size: 14px; color: var(--text-medium);">熟练程度: ${skill.level}%</div>
    `;
    
    container.appendChild(skillElement);
}

// 初始化表单
function initForms() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // 验证输入
            if (!name) {
                alert('请输入您的姓名');
                return;
            }
            if (!email) {
                alert('请输入您的邮箱');
                return;
            }
            if (!message) {
                alert('请输入留言内容');
                return;
            }
            
            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('请输入正确的邮箱格式');
                return;
            }
            
            // 创建留言对象
            const newMessage = {
                id: Date.now().toString(),
                name: name,
                email: email,
                message: message,
                date: new Date().toISOString(),
                status: 'visible' // 默认状态为可见
            };
            
            // 从localStorage获取现有留言
            const messages = JSON.parse(localStorage.getItem('messages')) || [];
            
            // 添加新留言
            messages.push(newMessage);
            
            // 保存到localStorage
            localStorage.setItem('messages', JSON.stringify(messages));
            
            // 显示成功提示
            showMessage('留言发送成功！我们会尽快回复您。', 'success');
            this.reset();
            
            // 在前端显示新留言（如果是公开状态）
            displayMessages();
        });
    }
}

// 显示留言功能
function displayMessages() {
    const messagesContainer = document.getElementById('messages-display');
    if (!messagesContainer) {
        // 如果没有留言显示区域，创建一个
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            const messagesSection = document.createElement('div');
            messagesSection.className = 'messages-display-section';
            messagesSection.innerHTML = `
                <h3 style="margin-bottom: 30px; text-align: center;">用户留言</h3>
                <div id="messages-display" class="messages-list"></div>
            `;
            contactSection.appendChild(messagesSection);
        }
    }
    
    // 获取所有可见留言
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const visibleMessages = messages.filter(msg => msg.status !== 'hidden');
    
    const displayContainer = document.getElementById('messages-display');
    if (displayContainer) {
        if (visibleMessages.length === 0) {
            displayContainer.innerHTML = '<p style="text-align: center; color: var(--text-medium);">暂无留言</p>';
            return;
        }
        
        // 按日期倒序排列（最新的在前）
        visibleMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        displayContainer.innerHTML = '';
        
        visibleMessages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.innerHTML = `
                <div class="message-header">
                    <h4>${message.name}</h4>
                    <span class="message-date">${formatDate(message.date)}</span>
                </div>
                <div class="message-content">
                    <p>${message.message}</p>
                </div>
                ${message.reply ? `
                    <div class="message-reply">
                        <div class="reply-header">
                            <span class="reply-badge">管理员回复</span>
                            <span class="reply-date">${formatDate(message.reply.date)}</span>
                        </div>
                        <div class="reply-content">
                            <p>${message.reply.content}</p>
                        </div>
                    </div>
                ` : ''}
            `;
            
            displayContainer.appendChild(messageElement);
        });
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
        return diffDays + '天前';
    } else {
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
}

// 简单的消息提示函数
function showMessage(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        background-color: ${type === 'success' ? '#38a169' : '#e53e3e'};
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 初始化后台管理入口
function initAdminEntry() {
    const adminEntryBtn = document.getElementById('admin-entry-btn');
    if (adminEntryBtn) {
        adminEntryBtn.addEventListener('click', showLoginModal);
    }
}



// 显示登录弹窗
function showLoginModal() {
    // 检查是否已被锁定
    const lockData = getLoginLockData();
    if (lockData.isLocked && Date.now() < lockData.unlockTime) {
        const remainingMinutes = Math.ceil((lockData.unlockTime - Date.now()) / (1000 * 60));
        showLoginError(`账户已被锁定，请在 ${remainingMinutes} 分钟后重试`);
        return;
    }
    
    // 创建登录弹窗
    const modal = createLoginModal();
    document.body.appendChild(modal);
    
    // 自动聚焦密码输入框
    setTimeout(() => {
        document.getElementById('admin-password-input').focus();
    }, 100);
}

// 创建登录弹窗HTML
function createLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'login-modal-overlay';
    modal.innerHTML = `
        <div class="login-modal">
            <div class="login-modal-header">
                <h3>后台管理验证</h3>
                <button class="login-modal-close" onclick="closeLoginModal()">&times;</button>
            </div>
            <div class="login-modal-content">
                <p class="login-modal-description">请输入管理员密码以进入后台管理</p>
                <div class="login-form-group">
                    <label for="admin-password-input">密码</label>
                    <input type="password" id="admin-password-input" placeholder="请输入密码" autocomplete="current-password">
                    <div class="login-error-message" id="login-error-message" style="display: none;"></div>
                </div>
                <div class="login-modal-actions">
                    <button type="button" class="btn btn-primary" onclick="attemptLogin()">登录</button>
                    <button type="button" class="btn btn-secondary" onclick="closeLoginModal()">取消</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加回车键监听
    const passwordInput = modal.querySelector('#admin-password-input');
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });
    
    // 点击遮罩层关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLoginModal();
        }
    });
    
    return modal;
}

// 关闭登录弹窗
function closeLoginModal() {
    const modal = document.querySelector('.login-modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
        clearLoginError();
    }
}

// 尝试登录
function attemptLogin() {
    const passwordInput = document.getElementById('admin-password-input');
    const password = passwordInput.value.trim();
    
    if (!password) {
        showLoginError('请输入密码');
        return;
    }
    
    // 获取存储的管理员密码
    const adminPassword = localStorage.getItem('adminPassword') || 'lxd123';
    
    if (password === adminPassword) {
        // 登录成功
        clearLoginError();
        closeLoginModal();
        
        // 检查是否是首次登录（使用默认密码）
        if (adminPassword === 'lxd123') {
            showMessage('首次登录，请修改默认密码', 'warning');
            // 可以在这里添加强制修改密码的逻辑
        }
        
        // 设置登录状态并跳转到后台管理
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        window.location.href = 'admin/index.html';
    } else {
        // 登录失败
        handleLoginFailure();
    }
}

// 处理登录失败
function handleLoginFailure() {
    const lockData = getLoginLockData();
    const newAttemptCount = (lockData.attemptCount || 0) + 1;
    
    // 更新尝试次数
    localStorage.setItem('loginAttempts', JSON.stringify({
        attemptCount: newAttemptCount,
        lastAttemptTime: Date.now()
    }));
    
    if (newAttemptCount >= 3) {
        // 锁定5分钟
        const unlockTime = Date.now() + (5 * 60 * 1000);
        localStorage.setItem('loginLockData', JSON.stringify({
            isLocked: true,
            lockTime: Date.now(),
            unlockTime: unlockTime
        }));
        
        showMessage('连续3次密码错误，账户已锁定5分钟', 'error');
        closeLoginModal();
    } else {
        const remainingAttempts = 3 - newAttemptCount;
        showLoginError(`密码不正确，请重试（剩余尝试次数：${remainingAttempts}）`);
    }
}

// 获取登录锁定数据
function getLoginLockData() {
    const attempts = localStorage.getItem('loginAttempts');
    const lockData = localStorage.getItem('loginLockData');
    
    let attemptData = { attemptCount: 0 };
    let lockDataResult = { isLocked: false };
    
    if (attempts) {
        try {
            attemptData = JSON.parse(attempts);
        } catch (e) {
            attemptData = { attemptCount: 0 };
        }
    }
    
    if (lockData) {
        try {
            lockDataResult = JSON.parse(lockData);
            // 检查锁定是否已过期
            if (lockDataResult.isLocked && Date.now() >= lockDataResult.unlockTime) {
                // 锁定已过期，重置状态
                localStorage.removeItem('loginLockData');
                localStorage.removeItem('loginAttempts');
                return { isLocked: false, attemptCount: 0 };
            }
        } catch (e) {
            lockDataResult = { isLocked: false };
        }
    }
    
    return {
        isLocked: lockDataResult.isLocked || false,
        attemptCount: attemptData.attemptCount || 0,
        unlockTime: lockDataResult.unlockTime || 0
    };
}

// 显示登录错误
function showLoginError(message) {
    const errorElement = document.getElementById('login-error-message');
    const passwordInput = document.getElementById('admin-password-input');
    
    if (errorElement && passwordInput) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        passwordInput.style.borderColor = '#e53e3e';
        
        // 震动效果
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
}

// 清除登录错误
function clearLoginError() {
    const errorElement = document.getElementById('login-error-message');
    const passwordInput = document.getElementById('admin-password-input');
    
    if (errorElement && passwordInput) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
        passwordInput.style.borderColor = '';
        passwordInput.value = '';
    }
}

// 显示登录错误消息（当账户锁定时）
function showLoginError(message) {
    showMessage(message, 'error');
}

// 滚动动画
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.section');
    const windowHeight = window.innerHeight;
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        
        if (sectionTop < windowHeight * 0.8) {
            section.classList.add('animate-in');
        }
    });
});

// 添加图片加载错误处理
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-photo';
        placeholder.textContent = '图片加载失败';
        e.target.parentNode.appendChild(placeholder);
    }
}, true);

// 响应式处理
window.addEventListener('resize', function() {
    // 这里可以添加响应式调整逻辑
    // 例如：调整图片大小、重新排列元素等
});