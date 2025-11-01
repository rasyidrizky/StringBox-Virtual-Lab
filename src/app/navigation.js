import { resetDragExercise } from './dragdrop.js';
import { loadLeaderboard } from './leaderboard.js';
import { loadProfilePage } from './profile.js';
import { loadUserProgress } from './progress.js';

export function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    const selectedButton = document.querySelector(`[data-page="${pageId}"]`);
    if (selectedButton) selectedButton.classList.add('active');
    
    if (pageId === 'practice') backToChapterSelection();
    if (pageId === 'drag-drop') resetDragExercise();
    if (pageId === 'leaderboard') loadLeaderboard();
    else if (pageId === 'profile') loadProfilePage();
    else if (pageId === 'material') loadUserProgress();
}

export function showChapterProblems(chapterNum) {
    document.getElementById('chapter-selection').style.display = 'none';
    document.getElementById('problems-container').style.display = 'block';
    
    const chapterTitles = {
        1: "Bab 1: Fondasi Pemrograman Python",
        2: "Bab 2: Mengontrol Alur Program", 
        3: "Bab 3: Bekerja dengan Kumpulan Data",
        4: "Bab 4: Struktur Data Lanjutan",
        5: "Bab 5: Membuat Kode Modular dengan Fungsi"
    };
    
    document.getElementById('current-chapter-title').textContent = chapterTitles[chapterNum];
    generateProblems(chapterNum);
}

export function backToChapterSelection() {
    document.getElementById('chapter-selection').style.display = 'block';
    document.getElementById('problems-container').style.display = 'none';
}