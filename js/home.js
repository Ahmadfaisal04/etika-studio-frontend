document.addEventListener('DOMContentLoaded', function() {
    // // Cek token login
    // const token = localStorage.getItem('authToken');
    // if (!token) {
    //     window.location.href = 'login.html';
    //     return;
    // }

    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            right: 'title'
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const dateParam = fetchInfo.startStr.substring(0, 10);
                const url = `http://103.84.207.100/api/reservations/range?start=${dateParam}&end=${fetchInfo.endStr.substring(0, 10)}`;

                const response = await fetch(url, {
                    // headers: {
                    //     'Authorization': `Bearer ${token}` // Tambahkan token jika diperlukan
                    // }
                });
                if (!response.ok) {
                    failureCallback('Fetch failed: ' + response.status);
                    return;
                }

                const data = await response.json();
                const events = (data || []).map(item => ({
                    title: item.EventName,
                    start: item.ReservedDate,
                    allDay: true,
                    extendedProps: {
                        participants: item.Participants,
                        image_url: item.ImageURL
                    }
                }));

                successCallback(events);
            } catch (error) {
                console.error('Error fetching events:', error);
                failureCallback(error);
            }
        },
        dateClick: function(info) {
            // const clicked

Date = new Date(info.dateStr);
            const today = new Date();
            clickedDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            if (clickedDate < today) {
                return;
            }

            document.getElementById('reserved_date').setAttribute('min', today.toISOString().split('T')[0]);
            document.getElementById('reserved_date').value = info.dateStr;

            const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
            modal.show();
        },
        eventClick: function(info) {
            const event = info.event;

            document.getElementById('detail_name').textContent = event.title || '-';
            document.getElementById('detail_participants').textContent = event.extendedProps.participants || '-';
            const imageElement = document.getElementById('detail_image');
            if (event.extendedProps.image_url) {
                imageElement.src = `http://103.84.207.100/${event.extendedProps.image_url}`;
                imageElement.style.display = 'block';
            } else {
                imageElement.style.display = 'none';
                imageElement.src = '';
            }

            const modal = new bootstrap.Modal(document.getElementById('eventDetailModal'));
            modal.show();
        }
    });

    calendar.render();

    const form = document.getElementById('reservationForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Buat FormData untuk mengirim data termasuk file
        const formData = new FormData();
        formData.append('reserved_date', document.getElementById('reserved_date').value);
        formData.append('event_name', document.getElementById('event_name').value);
        formData.append('participants', document.getElementById('participants').value);

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
            const response = await fetch('http://103.84.207.100/api/reservations', {
                method: 'POST',
                // headers: {
                //     'Authorization': `Bearer ${token}` // Tambahkan token jika diperlukan
                // },
                body: formData
            });

            if (response.ok) {
                alert('Reservasi berhasil ditambahkan!');
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
                modal.hide();
                calendar.refetchEvents();
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
            const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
            modal.show();
        });
    }
});