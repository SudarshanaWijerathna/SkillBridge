function toggleTask(el) {
    el.classList.toggle('completed');
    const row = el.closest('.schedule-row');
    if (el.classList.contains('completed')) {
        row.classList.add('row-completed');
    } else {
        row.classList.remove('row-completed');
    }
    
    // Update progress bar logic
    const allChecks = document.querySelectorAll('.status-check').length;
    const completedChecks = document.querySelectorAll('.status-check.completed').length;
    
    if(allChecks > 0) {
        const percent = (completedChecks / allChecks) * 100;
        const fill = document.querySelector('.progress-fill');
        const text = document.querySelector('.progress-text');
        
        if(fill) fill.style.width = percent + '%';
        if(text) text.innerText = `${completedChecks} / ${allChecks} Days Completed`;
    }
}