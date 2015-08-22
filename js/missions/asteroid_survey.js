$(document).ready(function() {


    document.getElementById('mission-start-asteroid-survey').addEventListener('click', function (e) {

        console.log('starting asteroid survey mission.');

        // any code to init the mission goes here...


        // tourist.js tour:
        var steps = [
            {
                content: "<p>Open the 'Targets panel'.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $('#nav-link-targets'),
                my: 'left center',
                at: 'right center'
            },
            {
                content: "<p>Select ' Asteroid Surveys' to view options.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $('#asteroidSurveys-link'),
                my: 'left center',
                at: 'right center'
            },
            {
                content: '<p>Fund a survey.</p>',
                highlightTarget: false,
                nextButton: true,
                target: $('#systemView-NEOs-link'),
                my: 'bottom center',
                at: 'top center'
            },
            {
                content: '<p>Click an asteroid in the scene.</p>',
                highlightTarget: false,
                nextButton: true,
                target: $('#science'),
                my: 'none',
                at: 'bottom center'
            },
            {
                content: '<p>Claim this asteroid!</p>',
                highlightTarget: true,
                nextButton: true,
                target: $('#claim-asteroid-button'),
                my: 'right center',
                at: 'left center'
            }
        ];

        var tour = new Tourist.Tour({
            steps: steps,
            tipClass: 'Bootstrap',
            tipOptions: { showEffect: 'slidein' }
        });
        tour.start();
    });
});
