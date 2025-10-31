import { calculateScore, showMessage } from '../service/assessment.js';
import { saveChapterScore } from '../service/score.js';
import { simulateChapter1, simulateChapter2, simulateChapter3, simulateChapter4, simulateChapter5 } from './chapters.js';

export async function runCode(problemId) {
    const editor = document.getElementById(`editor-${problemId}`);
    const output = document.getElementById(`output-${problemId}`);
    const scoreDisplay = document.getElementById(`score-${problemId}`);
    const code = editor.value.trim();
    
    if (!code) {
        showMessage(output, 'error', 'Kode kosong!');
        return;
    }
    
    const runButton = event.target.closest('.run-button');
    runButton.disabled = true;
    runButton.innerHTML = '<span>⏳</span><span>Menjalankan...</span>';
    
    setTimeout(async () => {
        const result = simulatePythonExecution(code, problemId);
        output.innerHTML = result.output;
        
        const score = calculateScore(code, problemId);
        scoreDisplay.textContent = `Skor: ${score}/100`;
        
        if (score >= 70) scoreDisplay.style.background = 'var(--gradient-accent)';
        else if (score >= 40) scoreDisplay.style.background = 'var(--text-muted)';
        else scoreDisplay.style.background = '#ef4444';
        
        runButton.disabled = false;
        runButton.innerHTML = '<span>▶</span><span>Jalankan Kode</span>';
        
        if (score >= 70) showMessage(output, 'success', 'Excellent!');
        
        const [chapter, problem] = problemId.split('-').map(Number);
        await saveChapterScore(chapter, problem, score);
    }, 1500);
}

export function simulatePythonExecution(code, problemId) {
    let output = '';
    const [chapter, problem] = problemId.split('-').map(Number);
    
    try {
        switch(chapter) {
            case 1: output = simulateChapter1(code, problem); break;
            case 2: output = simulateChapter2(code, problem); break;
            case 3: output = simulateChapter3(code, problem); break;
            case 4: output = simulateChapter4(code, problem); break;
            case 5: output = simulateChapter5(code, problem); break;
        }
        if (!output) output = 'Kode belum lengkap atau tidak sesuai dengan soal.';
    } catch (error) {
        output = `Error: ${error.message}`;
    }
    return { output };
}