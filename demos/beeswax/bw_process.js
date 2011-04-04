var BWP = {
    NUMNOTES : 80,
    BASENOTE : 21,

    // int, every array is long NUMNOTES
    stringpos : [],
    stringlength : [],
    status : [],

    // these are double
    stringcutoff : [],

    // this has to be declared later as an array of arrays.
    strings : null,

    samplerate: null,
    lpval : null,
    lplast: null,
    hpval: null,
    hplast: null,
    fcutoff: null,
    freso: null,
    ffeedback: null,
    feedback: null,
    cutoff: null,
    resonance: null,
    volume: null
};

BWP.process = function (data) {

    function tanh (arg) {
    // Returns the hyperbolic tangent of the number, defined as sinh(number)/cosh(number)
    //
    // version: 1103.1210
    // discuss at: http://phpjs.org/functions/tanh    // +   original by: Onno Marsman
    // *     example 1: tanh(5.4251848798444815);
    // *     returns 1: 0.9999612058841574
    return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
}

    var i, note,        //INTs
        sample, damp;   //Doubles

        for( i = 0; i < data.length; i+=1) {

		//sample = (((double)rand()/(double)RAND_MAX)*2.0-1.0)*0.001;
                sample = (Math.random() * 2 -1) * 0.001;

                for (note = 0; note < this.NUMNOTES; note += 1) {
                    damp = this.stringcutoff[note];

                    if( this.stringpos[note] > 0 ) {
                        this.strings[note][this.stringpos[note]] = this.strings[note][this.stringpos[note]] * damp + this.strings[note][this.stringpos[note]-1] * (1 - damp);
                    }

                    else {
                        this.strings[note][this.stringpos[note]] = this.strings[note][this.stringpos[note]] * damp + this.strings[note][this.stringlength[note]-1] * (1 - damp);
                    }

                    this.strings[note][this.stringpos[note]] = tanh(this.strings[note][this.stringpos[note]]) * 0.99;
                    sample += this.strings[note][this.stringpos[note]];
                }

                this.hpval += (sample - this.hplast) * 0.0001;
		this.hplast += this.hpval;
		this.hpval *= 0.96;
		sample -= this.hplast;

		this.lpval += (sample - this.lplast) * this.fcutoff * (1.0-tanh(this.lplast)*tanh(this.lplast)*0.9);
		this.lplast += this.lpval;
		this.lpval *= this.freso;
		sample = this.lplast;

                for(note = 0; note < NUMNOTES; note+=1 )
		{
			if(this.status[note] > 0 )
			{
				this.strings[note][this.stringpos[note]] += sample * this.ffeedback;
			}

			if( fabs( this.strings[note][this.stringpos[note]] ) <= 0.0001 )
				this.strings[note][this.stringpos[note]] = 0;

			this.stringpos[note]++;
			if(this.stringpos[note] >= this.stringlength[note] ) this.stringpos[note] = 0;
		}

                // TODO Check this! It does it in-place!
		data[i] = tanh( sample ) * (this.volume / 127);
	}

}

BWP.init = function () {

	var note, length, i,
            freq;

	this.feedback = 32;
	this.cutoff = 64;
	this.resonance = 64;
	this.volume = 100;

	this.fcutoff = Math.pow((this.cutoff + 50) / 200, 5 );
	this.freso = this.resonance / 127;
	this.ffeedback = 0.01 + Math.pow (this.feedback/127, 4) * 0.9;

	for( note = 0; note < NUMNOTES; note++ )
	{
		freq = 440 * Math.pow(2, (note + this.BASENOTE - 69) / 12);
		this.stringcutoff[note] = 0.9;
		length = this.samplerate / freq;
		this.stringlength[note] = length;
                
                //? fucking slow.
                this.strings = new Array(NUMNOTES);

                for (var i = 0; i < NUMNOTES; i++) {
                    this.strings[i] = new Array(20);
                }

                for( i = 0; i < length; i++ ) {
                    this.strings[note][i] = 0;
                }

                this.stringpos[note] = 0;
		this.status[note] = 0;
	}

	this.lpval = this.lplast = 0;
	this.hpval = this.hplast = 0;
}