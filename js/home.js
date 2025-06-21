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
                const url = `https://etika.studio/api/reservations/range?start=${dateParam}&end=${fetchInfo.endStr.substring(0, 10)}`;

                const response = await fetch(url);
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
            const imageElement = document.getElementById('detail_image');
            if (event.extendedProps.image_url) {
                imageElement.src = `https://etika.studio/${event.extendedProps.image_url}`;
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