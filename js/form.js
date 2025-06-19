document.addEventListener('DOMContentLoaded', function() {
    // Cek token login
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    document.getElementById('reserved_date').setAttribute('min', today.toISOString().split('T')[0]);

    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = {
            reserved_date: document.getElementById('reserved_date').value,
            customer_name: document.getElementById('customer_name').value,
            phone_number: document.getElementById('phone_number').value,
            email: document.getElementById('email').value,
            notes: document.getElementById('notes').value
        };
        try {
            const response = await fetch('http://192.168.1.110:8080/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert('Reservasi berhasil ditambahkan!');
                form.reset();
            } else {
                const errorData = await response.json();
                alert('Gagal menambahkan reservasi: ' + (errorData.message || response.status));
            }
        } catch (error) {
            console.error('Error posting reservation:', error);
            alert('Terjadi kesalahan saat mengirim data.');
        }
    });

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
