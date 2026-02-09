document.addEventListener('DOMContentLoaded', () => {
    // --- MAP LOGIC ---
    const wrapper = document.getElementById('roadmapWrapper');
    const container = document.getElementById('roadmap-container');
    
    // Only proceed if elements exist (e.g., we are on home page)
    if (!wrapper || !container) return;

    let scale = 1; let pointX = 0; let pointY = 0;
    let isDragging = false; let startX, startY;

    function setTransform() { container.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`; }
    
    window.centerMap = function() {
        const wrapperRect = wrapper.getBoundingClientRect();
        pointX = (wrapperRect.width - 600) / 2; pointY = 20; setTransform();
    }

    wrapper.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX - pointX; startY = e.clientY - pointY; wrapper.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', (e) => { if (!isDragging) return; e.preventDefault(); pointX = e.clientX - startX; pointY = e.clientY - startY; setTransform(); });
    window.addEventListener('mouseup', () => { isDragging = false; wrapper.style.cursor = 'grab'; });
    
    // --- ZOOM LOGIC ---
    wrapper.addEventListener('wheel', (e) => { 
        e.preventDefault(); 
        const xs = (e.clientX - wrapper.getBoundingClientRect().left - pointX) / scale; 
        const ys = (e.clientY - wrapper.getBoundingClientRect().top - pointY) / scale; 
        const delta = -e.deltaY; 
        const zoomFactor = 1.03; // Smooth zoom
        scale *= (delta > 0) ? zoomFactor : 1 / zoomFactor;
        scale = Math.min(Math.max(0.2, scale), 4); 
        pointX = e.clientX - wrapper.getBoundingClientRect().left - xs * scale; 
        pointY = e.clientY - wrapper.getBoundingClientRect().top - ys * scale; 
        setTransform(); 
    }, { passive: false });
    
    window.zoomIn = function() { scale *= 1.15; setTransform(); }
    window.zoomOut = function() { scale /= 1.15; setTransform(); }
    window.resetView = function() { scale = 1; centerMap(); }

    // --- COURSE DATA ---
    const courseDatabase = {
        "root": [ 
            { title: "Web Dev Bootcamp 2024", platform: "Udemy", rating: 4.8, students: "120k", img: "https://img-c.udemycdn.com/course/240x135/1565838_e54e_18.jpg" },
            { title: "CS50: Computer Science", platform: "Harvard/EdX", rating: 4.9, students: "5m", img: "https://prod-discovery.edx-cdn.org/media/course/image/0e575a39-bd1e-4537-ba01-dddea248fc0c-8372a9a27601.small.png" },
            { title: "The Complete JavaScript Course", platform: "Udemy", rating: 4.7, students: "800k", img: "https://img-c.udemycdn.com/course/240x135/851712_fc61_6.jpg" },
            { title: "React - The Complete Guide", platform: "Udemy", rating: 4.6, students: "650k", img: "https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg" },
            { title: "Python for Data Science", platform: "Coursera", rating: 4.8, students: "1.2m", img: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/08/33f720502a11e59e72391a3297a9b1/Logo_Python.png" },
            { title: "Machine Learning A-Z", platform: "Udemy", rating: 4.5, students: "900k", img: "https://img-c.udemycdn.com/course/240x135/950390_270f_3.jpg" },
            { title: "Google UX Design", platform: "Coursera", rating: 4.8, students: "800k", img: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/83/e258e0532611e5a53f854e4e975a50/HTML5-1.png" }
        ],
        "default": [ { title: "General Skill Mastery", platform: "Pluralsight", rating: 4.5, students: "10k", img: "https://pluralsight.imgix.net/course-images/java-fundamentals-language-v3.jpg" } ]
    };

    window.showCourses = function(nodeId, label) {
        const list = document.getElementById('coursesList');
        const labelEl = document.getElementById('skillLabel');
        if(labelEl) labelEl.textContent = "Recommended for: " + label;
        
        document.querySelectorAll('.pin-group').forEach(el => el.classList.remove('node-selected'));
        const nodeEl = document.getElementById('node-'+nodeId);
        if(nodeEl) nodeEl.classList.add('node-selected');
        
        const courses = courseDatabase[nodeId] || courseDatabase['root']; // Using root for demo scroll
        if(list) {
            list.innerHTML = "";
            courses.forEach(c => {
                list.innerHTML += `<div class="course-card"><img src="${c.img}" class="course-img" alt="Course"><div class="course-info"><h4>${c.title}</h4><div class="course-meta"><span class="course-platform">${c.platform}</span><div class="course-rating"><i class="fa-solid fa-star"></i> ${c.rating}</div></div><small style="color:var(--text-secondary)">${c.students} Students</small></div></div>`;
            });
        }
    }

    // --- RENDER ROADMAP ---
    const roadmapData = {
        id: "root", number: "01", label: "Start Here", description: "Begin",
        children: [
            { id: "2-1", number: "02", label: "Fundamentals", description: "Basics", children: [
                    { id: "3-1", number: "03", label: "Advanced A", description: "Frameworks", children: [
                            { id: "4-1", number: "04", label: "Backend", description: "Engineering", profession: "Senior Backend Eng", children: [] },
                            { id: "4-2", number: "04", label: "DevOps", description: "Cloud", profession: "Cloud Architect", children: [] }
                        ]
                    }
                ]
            },
            { id: "2-2", number: "02", label: "Design Track", description: "Visual", children: [
                    { id: "3-2", number: "03", label: "UI/UX", description: "Prototyping", children: [
                            { id: "4-3", number: "04", label: "Portfolio", description: "Projects", profession: "Product Designer", children: [] }
                        ]
                    },
                    { id: "3-3", number: "03", label: "Interaction", description: "Anim", profession: "Motion Designer", children: [] }
                ]
            }
        ]
    };

    // --- MULTI-SELECT PATH LOGIC ---
    const selectedNodeIds = new Set();

    function findPathToNode(targetId, currentNode, currentPath = []) {
        const newPath = [...currentPath, currentNode.id];
        if (currentNode.id === targetId) return newPath;
        if (currentNode.children) {
            for (let child of currentNode.children) {
                const res = findPathToNode(targetId, child, newPath);
                if (res) return res;
            }
        }
        return null;
    }

    window.togglePathSelection = function(targetId) {
        if (selectedNodeIds.has(targetId)) selectedNodeIds.delete(targetId);
        else selectedNodeIds.add(targetId);
        updateMapVisuals();
    }

    function updateMapVisuals() {
        const allElements = document.querySelectorAll('.pin-group, .connection-line, .prof-group');
        const svgContainer = document.querySelector('#roadmap-container');
        
        allElements.forEach(el => el.classList.remove('path-active'));
        
        if (selectedNodeIds.size === 0) {
            if(svgContainer) svgContainer.classList.remove('map-active-state');
            return;
        }

        if(svgContainer) svgContainer.classList.add('map-active-state');

        selectedNodeIds.forEach(id => {
            const pathIds = findPathToNode(id, roadmapData);
            if (pathIds) {
                pathIds.forEach((nodeId, index) => {
                    const nodeEl = document.getElementById('node-' + nodeId);
                    if(nodeEl) nodeEl.classList.add('path-active');
                    if (index > 0) {
                        const lineEl = document.getElementById('line-' + nodeId);
                        if(lineEl) lineEl.classList.add('path-active');
                    }
                });
                const profGroup = document.getElementById('prof-' + id);
                if(profGroup) profGroup.classList.add('path-active');
            }
        });
    }

    const config = { nodeRadius: 6, levelWidth: 200, nodeHeight: 140, startX: 50, startY: 50, pinScale: 0.15, pinBottomGap: 15 };

    function assignCoordinates(node, depth, currentYOffset) {
        node.x = config.startX + (depth * config.levelWidth);
        if (!node.children || node.children.length === 0) { node.y = config.startY + (currentYOffset * config.nodeHeight); return currentYOffset + 1; } 
        let nextY = currentYOffset; let childYs = [];
        node.children.forEach(child => { const r = assignCoordinates(child, depth + 1, nextY); childYs.push(child.y); nextY = r; });
        node.y = (childYs[0] + childYs[childYs.length - 1]) / 2;
        return nextY; 
    }

    function generateSVG(data) {
        const totalHeight = assignCoordinates(data, 0, 0);
        let maxDepth = 0; const findDepth = (n, d) => { if(d > maxDepth) maxDepth = d; n.children.forEach(c => findDepth(c, d+1)); }; findDepth(data, 0);
        const svgWidth = config.startX + (maxDepth * config.levelWidth) + 300;
        const svgHeight = config.startY + (totalHeight * config.nodeHeight) + 100;
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", svgWidth); svg.setAttribute("height", svgHeight);

        function renderNode(node) {
            if (node.children) {
                node.children.forEach(child => {
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    const d = `M ${node.x} ${node.y} C ${node.x + (config.levelWidth / 2)} ${node.y}, ${child.x - (config.levelWidth / 2)} ${child.y}, ${child.x} ${child.y}`;
                    path.setAttribute("d", d); path.setAttribute("class", "connection-line"); path.setAttribute("id", "line-" + child.id);
                    svg.appendChild(path);
                    renderNode(child);
                });
            }
            const pinGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            pinGroup.setAttribute("class", "pin-group");
            pinGroup.setAttribute("id", "node-" + node.id);
            pinGroup.addEventListener('click', (e) => { e.stopPropagation(); showCourses(node.id, node.label); });

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", node.x); circle.setAttribute("cy", node.y); circle.setAttribute("r", config.nodeRadius); circle.setAttribute("class", "node-circle");
            pinGroup.appendChild(circle);

            const pinPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pinPath.setAttribute("d", "M224.41,98.61c-4.7-34.89-21.25-62.5-50.97-81.81C152.96,3.5,130.43-1.88,106.21.58c-22.34,2.26-42.19,11.06-60.07,24.47C16.1,47.59,1.61,78.13.12,115.2c-.95,23.5,3.78,46.07,12.51,67.78,20.04,49.8,54.57,87.37,99.04,116.46,3.54,2.32,6.57,10-.45,31.74-19.82,56.58-46.28,75.29-78.51,17.98-30.96,28.48-64.21,29.11-103.66-.34-3.85-.7-11.07-1.66-18.21ZM111.71,202.95c-47.78-.17-87.16-40.24-87.1-88.63.06-49.1,39.91-88.71,89.03-88.48,48.29.23,87.84,40.22,87.7,88.67-.15,49.42-39.86,88.61-89.63,88.44Z");
            pinPath.setAttribute("class", "pin-shape");
            pinPath.setAttribute("transform", `translate(${node.x - (113*config.pinScale)}, ${node.y - (300*config.pinScale) - config.pinBottomGap}) scale(${config.pinScale})`);
            pinGroup.appendChild(pinPath);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", node.x); text.setAttribute("y", node.y - 28 - config.pinBottomGap); text.setAttribute("class", "pin-number"); text.textContent = node.number;
            pinGroup.appendChild(text);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", node.x); label.setAttribute("y", node.y + 25); label.setAttribute("class", "pin-label"); label.textContent = node.label;
            pinGroup.appendChild(label);
            svg.appendChild(pinGroup);

            if (node.profession) {
                const profG = document.createElementNS("http://www.w3.org/2000/svg", "g");
                profG.setAttribute("class", "prof-group");
                profG.setAttribute("id", "prof-" + node.id);
                profG.addEventListener('click', (e) => { e.stopPropagation(); togglePathSelection(node.id); });

                const profRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                const width = node.profession.length * 7 + 40;
                profRect.setAttribute("x", node.x + 40); profRect.setAttribute("y", node.y - 12); profRect.setAttribute("width", width); profRect.setAttribute("height", 24); profRect.setAttribute("class", "prof-badge-rect");
                
                const profText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                profText.setAttribute("x", node.x + 50); profText.setAttribute("y", node.y + 1); profText.setAttribute("class", "prof-badge-text"); profText.textContent = node.profession;

                const checkCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                checkCircle.setAttribute("cx", node.x + 40 + width - 15); checkCircle.setAttribute("cy", node.y); checkCircle.setAttribute("r", 8); checkCircle.setAttribute("class", "check-btn-circle");

                const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "text");
                checkIcon.setAttribute("x", node.x + 40 + width - 15); checkIcon.setAttribute("y", node.y + 1); checkIcon.setAttribute("class", "check-btn-icon"); checkIcon.textContent = "✔";

                profG.appendChild(profRect); profG.appendChild(profText); profG.appendChild(checkCircle); profG.appendChild(checkIcon);
                svg.appendChild(profG);
            }
        }
        renderNode(data);
        container.appendChild(svg);
    }

    window.simulateLoading = function() {
        const btn = document.querySelector('.prompt-send-btn');
        if(!btn) return;
        const icon = btn.querySelector('i');
        const input = document.getElementById('profInput');
        if(input && !input.value) return;
        
        if(icon) icon.className = "fa-solid fa-spinner fa-spin";
        setTimeout(() => { 
            if(icon) {
                icon.className = "fa-solid fa-check"; 
                setTimeout(() => icon.className = "fa-solid fa-paper-plane", 1000); 
            }
        }, 1000);
    }

    generateSVG(roadmapData);
    setTimeout(centerMap, 100);
});