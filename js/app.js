let selectedLayout = 1;

$(document).ready(function() {
    generateLayout($('#layout1'), 1);
    generateLayout($('#layout2'), 2);
    
    generateBitboard($('#bitboard1'), $('#decBitboard1'), false);
    generateBitboard($('#bitboard2'), $('#decBitboard2'), false);
    generateBitboard($('#bitboard3'), $('#decBitboard3'), true);
    
    loadCookies();   
    $('#container').show();
    
    $('#layoutRadio1').click(() => changeLayout(1));
    $('#layoutRadio2').click(() => changeLayout(2));
    
    $('#decBitboard1').keyup(() => decKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1')));
    $('#hexBitboard1').keyup(() => hexKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1')));
    $('#binBitboard1').keyup(() => binKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1')));
    
    $('#decBitboard2').keyup(() => decKeyUp($('#bitboard2'), $('#decBitboard2'), $('#hexBitboard2'), $('#binBitboard2')));
    $('#hexBitboard2').keyup(() => hexKeyUp($('#bitboard2'), $('#decBitboard2'), $('#hexBitboard2'), $('#binBitboard2')));
    $('#binBitboard2').keyup(() => binKeyUp($('#bitboard2'), $('#decBitboard2'), $('#hexBitboard2'), $('#binBitboard2')));
    
    $('#fillBitboard1').click(() => fillBitboard($('#decBitboard1')));
    $('#fillBitboard2').click(() => fillBitboard($('#decBitboard2')));
    
    $('#clearBitboard1').click(() => clearBitboard($('#decBitboard1')));
    $('#clearBitboard2').click(() => clearBitboard($('#decBitboard2')));
    
    $('#shlBitboard1').click(() => shlBitboard($('#decBitboard1')));
    $('#shlBitboard2').click(() => shlBitboard($('#decBitboard2')));
    
    $('#shrBitboard1').click(() => shrBitboard($('#decBitboard1')));
    $('#shrBitboard2').click(() => shrBitboard($('#decBitboard2')));
    
    $('#notBitboard1').click(() => notBitboard($('#decBitboard1')));
    $('#notBitboard2').click(() => notBitboard($('#decBitboard2')));
    
    $('#andBitboard3').click(() => doOperation((x, y) => x & y));
    $('#orBitboard3').click(() => doOperation((x, y) => x | y));
    $('#xorBitboard3').click(() => doOperation((x, y) => x ^ y));

    updateBitboard($('#bitboard1'),BigInt($('#decBitboard1').val()));
    updateBitboard($('#bitboard2'),BigInt($('#decBitboard2').val()));
    updateBitboard($('#bitboard3'),BigInt($('#decBitboard3').val()));
});

function generateLayout(layout, variant) {
    for (var y = 7; y >= 0; y--) {
        var row = $(document.createElement('div')).prop({
            class: 'layout-row'
        });
        
        for (var x = 0; x < 8; x++) {
            var value = bitIndexToLayout1(variant, x + y * 8);
            if (value == undefined) {
                value = ".."
            } else if (value < 10) {
                value = '0' + value;
            }
            
            var span = $(document.createElement('span')).html(value);
            row.append(span);
        }
        
        layout.append(row);
    }
}

function generateBitboard(bitboard, decTextbox, readOnly) {
	// Add bottom div for column buttons
	if (!readOnly) {
		var bottom_row = $(document.createElement('div')).prop({
			class: 'bitboard-row'
		});
	}
	
	for (var y = 6; y >= 0; y--) {
		var row = $(document.createElement('div')).prop({
			class: 'bitboard-row'
		});
		
		// Add buttons to fill a row
		if (!readOnly){
			var row_button = $(document.createElement('button')).prop({
				type: 'rowbutton',
				value: y,
				id: y,
				class: "btn btn-primary",
			});
			
			row_button.click(((v) => () => rowClick(bitboard, decTextbox, v))(y))
		}
		
		// Buttons to fill columns
		const files =  ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
		if (!readOnly) {
			var colbutton = $(document.createElement('button')).prop({
				type: 'colbutton',
				value: files[y],
				id: y,
				class: "btn btn-primary",
				style: y == 6 ? "margin-left: 20px" : ""
			});
			
			colbutton.click(((v) => () => colClick(bitboard, decTextbox, v))(files[y]))
		}
		
		// Checkboxes
		for (var x = 0; x < 7; x++) {
			var value = x + y * 7;
			var checkbox = $(document.createElement('input')).prop({
				type: 'checkbox',
				value: value,
			});
			
			if (readOnly) {
				checkbox.prop('readonly', true);
			}

			checkbox.click(((v) => () => bitboardCheckboxClick(bitboard, decTextbox, v))(value));
			
			if (!readOnly) {
				row.prepend(row_button);
			}
				
			if (!readOnly) {
				bottom_row.append(colbutton);
			}
			
			row.append(checkbox);
		}
		
		bitboard.append(row);
		
		if (!readOnly) {
			bitboard.append(bottom_row)
		};

	}
	
	if (readOnly){
		var colspacer = $(document.createElement('div')).prop({
			class: 'colspacer'
		});
		bitboard.append(colspacer)
    }
}

function loadCookies() {
    var selectedLayoutCookie = Cookies.get('selectedLayout');
    if (selectedLayoutCookie != undefined) {
        selectedLayout = parseInt(selectedLayoutCookie);
        $('#layoutRadio' + selectedLayoutCookie).prop('checked', true);
    }
    else {
        $('#layoutRadio1').prop('checked', true);
    }
}

function changeLayout(variant) {
    selectedLayout = variant;
    refreshValuesAfterLayoutChange();
    
    Cookies.set('selectedLayout', variant, { expires: 10 * 365 });
}

function refreshValuesAfterLayoutChange() {
    decKeyUp($('#bitboard1'), $('#decBitboard1'), $('#hexBitboard1'), $('#binBitboard1'));
    decKeyUp($('#bitboard2'), $('#decBitboard2'), $('#hexBitboard2'), $('#binBitboard2'));
    decKeyUp($('#bitboard3'), $('#decBitboard3'), $('#hexBitboard3'), $('#binBitboard3'));
}

function doOperation(operation) {
    var value1 = BigInt($('#decBitboard1').val());
    var value2 = BigInt($('#decBitboard2').val());
    var result = operation(value1, value2);
    
    updateReadOnlyTextboxes(result);
    updateBitboard($('#bitboard3'), result);
}

function decKeyUp(bitboard, decTextbox, hexTextbox, binTextbox) {
    var bigIntValue = BigInt(decTextbox.val());
    hexTextbox.val('0x' + bigIntValue.toString(16));
    binTextbox.val('0b' + bigIntValue.toString(2));
    
    updateBitboard(bitboard, bigIntValue);
}

function hexKeyUp(bitboard, decTextbox, hexTextbox, binTextbox) {
    var bigIntValue = BigInt(hexTextbox.val());
    decTextbox.val(bigIntValue.toString(10));
    binTextbox.val('0b' + bigIntValue.toString(2));
    
    updateBitboard(bitboard, bigIntValue);
}

function binKeyUp(bitboard, decTextbox, hexTextbox, binTextbox) {
    var bigIntValue = BigInt(binTextbox.val());
    decTextbox.val(bigIntValue.toString(10));
    hexTextbox.val('0x' + bigIntValue.toString(16));
    
    updateBitboard(bitboard, bigIntValue);
}

function updateReadOnlyTextboxes(value) {
    $('#decBitboard3').val(value.toString(10));
    $('#hexBitboard3').val('0x' + value.toString(16));
    $('#binBitboard3').val('0b' + value.toString(2));
}

function updateBitboard(bitboard, value) {
    for (var index = 0; index < 64; index++) {
        var bit = value & 1n;
        value = value >> 1n;
        
        var bitboardIndex = bitIndexToLayout1(selectedLayout, index);
        if (bitboardIndex < 7 * 7)
            bitboard.find('input[type=checkbox][value=' + bitboardIndex + ']').prop('checked', bit != 0);
    }
}

function bitboardCheckboxClick(bitboard, decTextbox, index) {
    var checkbox = bitboard.find('input[type=checkbox][value=' + index + ']');
    var state = checkbox.prop('checked');
    var variantIndex = BigInt(bitIndexToLayout1(selectedLayout, index));
    var value = BigInt(decTextbox.val());
    value = (value & ~(1n << variantIndex)) | (BigInt(state ? 1 : 0) << variantIndex);
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

function rowClick(bitboard, decTextbox, rank){
    // Magic number is a fully filled 8th rank
    var toprow = rank1(selectedLayout);
    // Inverse the shiftvalue for different layouts
    var shiftval = BigInt(calcRowShiftValue(selectedLayout, rank));
    var row = toprow << shiftval;
    // OR the existing field and the newly filled row
    var newvalue = BigInt(decTextbox.val()) | row;

    // If the row is filled, clear it
    if(newvalue === BigInt(decTextbox.val())){
        newvalue = newvalue & ~(row);
    }

    decTextbox.val(newvalue);
    
    refreshValuesAfterLayoutChange();
}

function colClick(bitboard, decTextbox, file){
    const files =  ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    file = BigInt(files.indexOf(file));
    // Magic number is a fully filled H file
    var rightcol = fileG(selectedLayout);
    // Inverse the shiftvalue for different layouts
    var shiftval = calcColShiftValue(selectedLayout, file);
    var col =  rightcol >> shiftval;
    // OR the existing field and the newly filled col
    var newvalue = BigInt(decTextbox.val()) | col;
    
    // If the row is filled, clear it
    if(newvalue === BigInt(decTextbox.val())){
        newvalue = newvalue & ~(col);
    }

    decTextbox.val(newvalue);
    
    refreshValuesAfterLayoutChange();
}

function fillBitboard(decTextbox) {
    decTextbox.val(allSquares(selectedLayout).toString(10));
    refreshValuesAfterLayoutChange();
}

function clearBitboard(decTextbox) {
    decTextbox.val('0');
    refreshValuesAfterLayoutChange();
}

function shlBitboard(decTextbox) {
    var value = BigInt(decTextbox.val());
    value = (value << 1n) & allSquares(selectedLayout);
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

function shrBitboard(decTextbox) {
    var value = BigInt(decTextbox.val());
    value = (value >> 1n) & allSquares(selectedLayout);
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

function notBitboard(decTextbox) {
    var value = BigInt(decTextbox.val());
    value = allSquares(selectedLayout) ^ value;
    decTextbox.val(value);
    
    refreshValuesAfterLayoutChange();
}

// input: bit index (0-63) -> layout1 (0-48)
function bitIndexToLayout1(variant, idx) {
    switch (variant) {
        case 1:
            return idx >= 7 * 7 ? undefined : idx;
        case 2:
            x = idx % 8;
            y = Math.floor(idx / 8);
            return x == 7 || y == 7 ? undefined : x + y * 7;
    }
    
    return 0;
}

function calcRowShiftValue(variant, value) {
    switch (variant) {
        case 1: return value * 7;
        case 2: return value * 8;
    }
}

function calcColShiftValue(variant, value) {
    switch (variant) {
        case 1: return value;
        case 2: return value;
    }
}

function allSquares(variant) {
    switch (variant) {
        case 1: return 0x1ffffffffffffn
        case 2: return 0x7f7f7f7f7f7f7fn
    }
}

function fileG(variant) {
    switch (variant) {
        case 1: return 0x1020408102040n
        case 2: return 0x40404040404040n
    }
}

function rank1(variant) {
    switch (variant) {
        case 1: return 0x000000000007fn
        case 2: return 0x7fn
    }
}