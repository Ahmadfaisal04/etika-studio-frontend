document.addEventListener('DOMContentLoaded', function() {
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
                const url = `http://192.168.1.110:8080/api/reservations/range?start=${dateParam}&end=${fetchInfo.endStr.substring(0, 10)}`;

                const response = await fetch(url);
                if (!response.ok) {
                    failureCallback('Fetch failed: ' + response.status);
                    return;
                }

                const data = await response.json();
                const events = (data || []).map(item => ({
                    title: item.CustomerName,
                    start: item.ReservedDate,
                    allDay: true,
                    extendedProps: {
                        email: item.Email,
                        notes: item.Notes
                    }
                }));

                successCallback(events);
            } catch (error) {
                console.error('Error fetching events:', error);
                failureCallback(error);
            }
        },
        dateClick: function(info) {
            const clickedDate = new Date(info.dateStr);
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
            document.getElementById('detail_notes').textContent = event.extendedProps.notes || '-';
            const modal = new bootstrap.Modal(document.getElementById('eventDetailModal'));
            modal.show();
        }
    });

    calendar.render();

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
                const modal = bootstrap.Modal.getInstance(document.getElementById('reservationModal'));
                modal.hide();
                calendar.refetchEvents();
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
