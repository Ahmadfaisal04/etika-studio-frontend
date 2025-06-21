document.addEventListener('DOMContentLoaded', function() {
    // Cek token login
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Set batas minimum tanggal ke hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    document.getElementById('reserved_date').setAttribute('min', today.toISOString().split('T')[0]);

    // Handle submit form
    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Buat FormData untuk mengirim data termasuk file
        const formData = new FormData();
        formData.append('reserved_date', document.getElementById('reserved_date').value);
        formData.append('event_name', document.getElementById('event_name').value);
        
        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            // Validasi ukuran file (max 10MB)
            if (imageFile.size > 10 * 1024 * 1024) {
                alert('Ukuran gambar tidak boleh lebih dari 10MB.');
                return;
            }
            // Validasi tipe file
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(imageFile.type)) {
                alert('Hanya file JPG atau PNG yang diizinkan.');
                return;
            }
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('http://localhost:8080/api/reservations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Tambahkan token jika endpoint memerlukan autentikasi
                },
                body: formData // Kirim sebagai FormData, bukan JSON
            });

            if (response.ok) {
                alert('Reservasi berhasil ditambahkan!');
                form.reset();
            } else {
                const errorData = await response.json();
                alert('Gagal menambahkan reservasi: ' + (errorData.message || response.statusText));
            }
        } catch (error) {
            console.error('Error posting reservation:', error);
            alert('Terjadi kesalahan saat mengirim data.');
        }
    });

    // Handle tombol tambah reservasi (opsional)
    const addReservationBtn = document.getElementById('addReservationBtn');
    if (addReservationBtn) {
        addReservationBtn.addEventListener('click', function() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            document.getElementById('reserved_date').setAttribute('min', today.toISOString().split('T')[0]);
            document.getElementById('reserved_date').value = today.toISOString().split('T')[0];
        });
    }
});