// Enhanced interactivity for OmniEVA blog
document.addEventListener('DOMContentLoaded', function() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Table sorting functionality
    function initTableSorting() {
        const tables = document.querySelectorAll('.interactive-table');
        
        tables.forEach(table => {
            const headers = table.querySelectorAll('th');
            
            headers.forEach((header, index) => {
                // Skip the first column (method names) from sorting
                if (index === 0) return;
                
                header.classList.add('sortable');
                header.addEventListener('click', () => {
                    sortTable(table, index, header);
                });
            });
            
            // Initially highlight best results
            highlightBestResults(table);
        });
    }

    function sortTable(table, columnIndex, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Determine current sort direction
        const isAscending = !header.classList.contains('sort-asc');
        
        // Clear all sort classes
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc', 'sort-indicator-animate');
        });
        
        // Add sort class to current header
        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
        header.classList.add('sort-indicator-animate');
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = getCellValue(a, columnIndex);
            const bValue = getCellValue(b, columnIndex);
            
            if (aValue === bValue) return 0;
            
            let comparison;
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else {
                comparison = aValue.toString().localeCompare(bValue.toString());
            }
            
            return isAscending ? comparison : -comparison;
        });
        
        // Reorder rows in DOM
        rows.forEach(row => tbody.appendChild(row));
        
        // Re-highlight best results after sorting
        setTimeout(() => {
            highlightBestResults(table);
        }, 100);
    }

    function getCellValue(row, columnIndex) {
        const cell = row.cells[columnIndex];
        const text = cell.textContent.trim();
        
        // Handle different data formats
        if (text === '-' || text === '') {
            return -999; // Treat as lowest value
        }
        
        // Remove % and convert to number
        const numericValue = parseFloat(text.replace('%', ''));
        return isNaN(numericValue) ? text : numericValue;
    }

    function highlightBestResults(table) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Clear existing highlights
        table.querySelectorAll('td').forEach(td => {
            td.className = td.className.replace(/\brank-\d+\b/g, '');
        });
        
        // Get all numeric columns (skip first column which is method names)
        const headers = table.querySelectorAll('th');
        for (let colIndex = 1; colIndex < headers.length; colIndex++) {
            const columnValues = [];
            
            rows.forEach((row, rowIndex) => {
                const value = getCellValue(row, colIndex);
                if (typeof value === 'number' && value !== -999) {
                    columnValues.push({ value, row: rowIndex });
                }
            });
            
            // Sort values in descending order (highest first)
            columnValues.sort((a, b) => b.value - a.value);
            
            // Apply ranking colors to all results
            columnValues.forEach((item, rank) => {
                const cell = rows[item.row].cells[colIndex];
                const rankClass = `rank-${Math.min(rank + 1, 8)}`; // Cap at rank-8 for very low scores
                cell.classList.add(rankClass);
            });
        }
    }

    // Table row highlighting and interaction
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // Remove active class from all rows in the same table
            const currentTable = this.closest('table');
            currentTable.querySelectorAll('tbody tr').forEach(r => r.classList.remove('active'));
            // Add active class to clicked row
            this.classList.add('active');
        });
    });

    // Enhanced hover effects for table cells
    function addTableCellHoverEffects() {
        const tables = document.querySelectorAll('.interactive-table');
        
        tables.forEach(table => {
            const cells = table.querySelectorAll('td');
            
            cells.forEach(cell => {
                cell.addEventListener('mouseenter', function() {
                    const columnIndex = Array.from(this.parentNode.children).indexOf(this);
                    const rowIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
                    
                    // Highlight column
                    table.querySelectorAll(`td:nth-child(${columnIndex + 1}), th:nth-child(${columnIndex + 1})`).forEach(el => {
                        el.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                    });
                    
                    // Highlight row
                    this.parentNode.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                });
                
                cell.addEventListener('mouseleave', function() {
                    const columnIndex = Array.from(this.parentNode.children).indexOf(this);
                    
                    // Remove column highlight
                    table.querySelectorAll(`td:nth-child(${columnIndex + 1}), th:nth-child(${columnIndex + 1})`).forEach(el => {
                        el.style.backgroundColor = '';
                    });
                    
                    // Remove row highlight
                    this.parentNode.style.backgroundColor = '';
                });
            });
        });
    }

    // Animated counters for performance metrics
    function animateCounters() {
        const counters = document.querySelectorAll('td');
        counters.forEach(counter => {
            // Skip the first column (Method names) and only animate numeric values
            const isFirstColumn = counter.parentElement.children[0] === counter;
            if (!isFirstColumn && (counter.textContent.includes('%') || counter.textContent.includes('.'))) {
                const target = parseFloat(counter.textContent.replace('%', ''));
                // Only proceed if parseFloat returned a valid number
                if (isNaN(target)) return;
                const increment = target / 30; // Faster animation (30 steps instead of 50)
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        if (counter.textContent.includes('%')) {
                            counter.textContent = current.toFixed(1) + '%';
                        } else {
                            counter.textContent = current.toFixed(2);
                        }
                        setTimeout(updateCounter, 20); // Faster intervals (20ms instead of 30ms)
                    } else {
                        if (counter.textContent.includes('%')) {
                            counter.textContent = target.toFixed(1) + '%';
                        } else {
                            counter.textContent = target.toFixed(2);
                        }
                    }
                };
                
                // Only animate when element comes into view - with much more responsive settings
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            updateCounter();
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.01, // Much lower threshold
                    rootMargin: '200px 0px 200px 0px' // Start animation much earlier
                });
                observer.observe(counter);
            }
        });
    }

    // Section fade-in animation on scroll - much more responsive
    const observerOptions = {
        threshold: 0.01, // Very low threshold for immediate triggering
        rootMargin: '300px 0px 300px 0px' // Show sections much earlier - larger margin
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Make ALL sections immediately visible to eliminate dynamic loading delays
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        // Make all sections immediately visible for better user experience
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        section.style.transition = 'none'; // Remove all transitions for immediate loading
        
        // Only apply minimal animation for sections beyond the first 3 if motion is preferred
        if (!prefersReducedMotion && index > 2) {
            section.style.transition = 'opacity 0.1s ease'; // Minimal transition
            sectionObserver.observe(section);
        }
    });

    // Initialize all table features
    initTableSorting();
    addTableCellHoverEffects();

    // Initialize counter animation
    animateCounters();

    // Copy to clipboard functionality for code blocks
    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre');
        codeBlocks.forEach(block => {
            const button = document.createElement('button');
            button.innerHTML = '<i class="fas fa-copy"></i>';
            button.className = 'copy-btn';
            button.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.3s ease;
            `;
            
            block.style.position = 'relative';
            block.appendChild(button);
            
            button.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent);
                button.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        });
    }

    // Tooltip functionality
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-popup';
                tooltip.textContent = this.getAttribute('data-tooltip');
                tooltip.style.cssText = `
                    position: absolute;
                    background: #1e293b;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    z-index: 1000;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    pointer-events: none;
                `;
                
                document.body.appendChild(tooltip);
                
                const updatePosition = (e) => {
                    tooltip.style.left = e.pageX + 10 + 'px';
                    tooltip.style.top = e.pageY - 30 + 'px';
                };
                
                this.addEventListener('mousemove', updatePosition);
                
                this.addEventListener('mouseleave', () => {
                    tooltip.remove();
                    this.removeEventListener('mousemove', updatePosition);
                });
            });
        });
    }

    // Initialize additional features
    addCopyButtons();
    initTooltips();

    // Mobile menu toggle (if needed)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavLinks.classList.toggle('active');
        });
    }

    // Aggressive image loading - load images much earlier
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('loading');
                    observer.unobserve(img);
                }
            });
        }, {
            threshold: 0.01,
            rootMargin: '500px 0px 500px 0px' // Load images much earlier
        });

        // Load all images with data-src immediately on page load to reduce dynamic loading
        document.querySelectorAll('img[data-src]').forEach(img => {
            // Load critical images immediately
            const isCritical = img.closest('.hero') || img.closest('.section[id="Method"]') || 
                             img.closest('.section[id="benchmark"]');
            if (isCritical) {
                img.src = img.dataset.src;
                img.classList.remove('loading');
            } else {
                imageObserver.observe(img);
            }
        });
    } else {
        // Fallback: load all images immediately if IntersectionObserver is not supported
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('loading');
        });
    }
});

// Add CSS for active navigation and table states
const style = document.createElement('style');
style.textContent = `
    .nav-links a.active {
        color: #667eea !important;
        background: rgba(102, 126, 234, 0.1) !important;
    }
    
    tbody tr.active {
        background: linear-gradient(135deg, #667eea, #764ba2) !important;
        color: white !important;
        transform: scale(1.02) !important;
    }
    
    .copy-btn:hover {
        background: rgba(255,255,255,0.3) !important;
    }
    
    @media (max-width: 768px) {
        .nav-links {
            position: fixed;
            top: 60px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 60px);
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: start;
            padding-top: 2rem;
            transition: left 0.3s ease;
        }
        
        .nav-links.active {
            left: 0;
        }
        
        .mobile-menu-btn {
            display: block;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #667eea;
            cursor: pointer;
        }
    }
    
    @media (min-width: 769px) {
        .mobile-menu-btn {
            display: none;
        }
    }
`;
document.head.appendChild(style);
