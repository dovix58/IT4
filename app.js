$(document).ready(function () {

    $('#movieForm').on('submit', function (event) {
        event.preventDefault();

        let movieName = $('#movieName').val().trim();
        let movieRating = parseInt($('#movieRating').val());

        if (movieName === '') {
            alert('Please enter a movie name.');
            return;
        }
        if (isNaN(movieRating) || movieRating < 1 || movieRating > 10) {
            alert('Please enter a rating between 1 and 10.');
            return;
        }

        let movieData = {
            name: movieName,
            rating: movieRating
        };

        if (movieRating > 7) {
            $('.liked').css('display', 'inline');
            $('.disliked').css('display', 'none');
        } else {
            $('.disliked').css('display', 'inline');
            $('.liked').css('display', 'none');
        }

        let newRow = `
            <tr>
                <td>${movieName}</td>
                <td class="rating">${movieRating}</td>
                <td>
                    <button class="boldButton">Make Bold</button>
                    <button class="deleteButton">Delete</button>
                </td>
            </tr>
        `;
        $('#movieTable tbody').append(newRow);

        let movieJson = JSON.stringify([movieData]);

        $.ajax({
            url: 'https://jsonblob.com/api/jsonBlob',
            method: 'POST',
            contentType: 'application/json',
            data: movieJson,
            success: function (response, status, xhr) {
                let jsonBlobUrl = xhr.getResponseHeader('Location');
                console.log('JSON Blob created at:', jsonBlobUrl);

                let blobId = jsonBlobUrl.split('/').pop();
                localStorage.setItem('blobId', blobId);
            },
            error: function (error) {
                console.log('Error saving movie data:', error);
            }
        });

        $('#movieName').val('');
        $('#movieRating').val('');
    });

    $('#changeRatingButton').on('click', function () {
        let rowIndex = parseInt($('#rowIndex').val());
        let newRating = parseInt($('#newRating').val());

        if (isNaN(rowIndex) || rowIndex < 1) {
            alert('Please enter a valid row index (1 or higher).');
            return;
        }
        if (isNaN(newRating) || newRating < 1 || newRating > 10) {
            alert('Please enter a valid rating between 1 and 10.');
            return;
        }

        let rowToChange = $('#movieTable tbody tr').eq(rowIndex - 1);

        if (rowToChange.length) {
            rowToChange.find('.rating').text(newRating);

            if (newRating > 7) {
                $('.liked').css('display', 'inline');   // Show Liked
                $('.disliked').css('display', 'none'); // Hide Disliked
            } else {
                $('.disliked').css('display', 'inline'); // Show Disliked
                $('.liked').css('display', 'none');     // Hide Liked
            }
        } else {
            alert('No row exists at the specified index.');
        }

        $('#updateRowIndex').val('');
        $('#newRating').val('');
    });

    $('#removeRowButton').on('click', function () {
        let rowIndex = parseInt($('#removeIndex').val());

        if (isNaN(rowIndex) || rowIndex < 1) {
            alert('Please enter a valid row index (1 or higher).');
            return;
        }

        let rowToRemove = $('#movieTable tbody tr').eq(rowIndex - 1);

        if (rowToRemove.length) {
            rowToRemove.remove(); // Remove the selected row
            $('#rowIndex').val(''); // Clear the input field
        } else {
            alert('No row exists at the specified index.');
        }
    });


    $('#movieTable').on('click', '.boldButton', function () {
        $(this).closest('tr').toggleClass('boldRow');
    });

    $('#movieTable').on('click', '.deleteButton', function () {
        $(this).closest('tr').remove();
    });

    $('#loadDataButton').on('click', function () {
        let blobId = localStorage.getItem('blobId');
        if (!blobId) {
            alert('No API URL saved. Please save a movie first.');
            return;
        }

        let apiUrl = `https://jsonblob.com/api/jsonBlob/${blobId}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched movie data:', data);
                let movie = data[0];

                // Clear the current table data
                $('#movieTable tbody').empty();


                let newRow = `
                    <tr>
                        <td>${movie.name}</td>
                        <td class="rating">${movie.rating}</td>
                        <td>
                            <button class="boldButton">Make Bold</button>
                            <button class="deleteButton">Delete</button>
                        </td>
                    </tr>
                `;
                $('#movieTable tbody').append(newRow);
            })
            .catch(error => {
                console.error('Error fetching movie data:', error);
            });
    });
});
