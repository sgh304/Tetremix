function clearErrors(errorRow) {
    $('.alert').remove();
}

function makeError(message) {
    return '<div class = \'alert alert-danger\'>' + message + '</div>'; 
}

function validate() {
    clearErrors();
    let error = false;
    const formArray = $('form').serializeArray();
    formArray.forEach((inputElement) => {
        const value = inputElement.value;
        switch (inputElement.name) {
            case 'name':
                if (value === '') {
                    error = true;
                    $('input[name=\'name\']').after(makeError('Please enter a name for your game mode.'));
                }
                break;
            case 'description':
                if (value === '') {
                    error = true;
                    $('input[name=\'description\']').after(makeError('Please enter a description for your game mode.'));
                }
                break;
            case 'normalGravity':
                const normalGravity = Number(value);
                if (isNaN(normalGravity) || normalGravity < 0 || normalGravity > 999) {
                    error = true;
                    $('input[name=\'normalGravity\']').after(makeError('Please enter a normal gravity between 0 and 999.'));
                }
                break;
            case 'downGravity':
                const downGravity = Number(value);
                if (isNaN(downGravity) || downGravity < 0 || downGravity > 999) {
                    error = true;
                    $('input[name=\'downGravity\']').after(makeError('Please enter a down gravity between 0 and 999.'));
                }
                break;
            case 'autoshift':
                const autoshift = Number(value);
                if (isNaN(autoshift) || autoshift < 0 || autoshift > 999) {
                    error = true;
                    $('input[name=\'autoshift\']').after(makeError('Please enter an autoshift between 0 and 999.'));
                }
                break;
            case 'das':
                const das = Number(value);
                if (isNaN(das) || das < 0 || das > 999) {
                    error = true;
                    $('input[name=\'das\']').after(makeError('Please enter a DAS between 0 and 999.'));
                }
                break;
            case 'hoverFrames':
                const hoverFrames = Number(value);
                if (isNaN(hoverFrames) || hoverFrames < 0 || hoverFrames > 999) {
                    error = true;
                    $('input[name=\'hoverFrames\']').after(makeError('Please enter a number of hover frame between 0 and 999.'));
                }
                break;
            case 'clearGoal':
                if (value != '') {
                    const clearGoal = Number(value);
                    if (isNaN(clearGoal) || clearGoal < 1 || clearGoal > 999) {
                        error = true;
                        $('input[name=\'clearGoal\']').after(makeError('Please enter a clear goal between 1 and 999.'));
                    }
                }
                break;
            case 'timeGoal':
                if (value != '') {
                    const timeGoal = Number(value);
                    if (isNaN(timeGoal) || timeGoal < 1 || timeGoal > 9999) {
                        error = true;
                        $('input[name=\'timeGoal\']').after(makeError('Please enter a time goal between 1 and 9999.'));
                    }
                }
                break;
            case 'junkTime':
                if (value != '') {
                    const junkTime = Number(value);
                    if (isNaN(junkTime) || junkTime < 1 || junkTime > 999) {
                        error = true;
                        $('input[name=\'junkTime\']').after(makeError('Please enter a junk time between 1 and 999.'));
                    }
                }
                const junkAmount = Number($('input[name=\'junkAmount\']').val());
                if (isNaN(junkAmount) || junkAmount < 1 || junkAmount > 9) {
                    error = true;
                    $('input[name=\'junkAmount\']').after(makeError('Please enter a junk amount between 1 and 9.'));
                }
                break;
            case 'junkAmount':
                if (value != '') {
                    const junkTime = Number($('input[name=\'junkTime\']').val());
                    if (isNaN(junkTime) || junkTime < 1 || junkTime > 999) {
                        error = true;
                        $('input[name=\'junkTime\']').after(makeError('Please enter a junk time between 1 and 999.'));
                    }
                }
                break;
        }
    })
    return (!error);
}