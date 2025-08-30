document.getElementById('solicitante-btn').onclick = function() {
    document.getElementById('solicitante-section').classList.remove('hidden');
    document.getElementById('donante-section').classList.add('hidden');
};
document.getElementById('donante-btn').onclick = function() {
    document.getElementById('donante-section').classList.remove('hidden');
    document.getElementById('solicitante-section').classList.add('hidden');
};