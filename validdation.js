//Đối tượng validator
function Validator(options) {

    var selectorRules = {};

    //Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorMessage = rule.test(inputElement.value);
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);

        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        //Lặp qua từng rule & kiểm tra
        //Nếu có lỗi thì  dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        return !errorMessage;
    }
    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        //khi submit form element
        formElement.onsubmit = function(e) {
                e.preventDefault();

                var isFormValid = true;


                //Lặp qua từng  rule và validate luôn
                options.rules.forEach(function(rule) {
                    var inputElement = formElement.querySelector(rule.selector);
                    var isValid = validate(inputElement, rule);
                    if (!isValid) {
                        isFormValid = false;
                    }
                });


                if (isFormValid) {
                    //Trường hợp submit với javascript
                    if (typeof options.onSubmit === 'function') {
                        var enableInputs = formElement.querySelectorAll('[name]');

                        var formValues = Array.from(enableInputs).reduce(function(values, input) {
                            values[input.name] = input.value;
                            return values;
                        }, {});

                        options.onSubmit(formValues);
                    }
                    //Trường hợp submit với hành vi mặc định
                    else {
                        formElement.submit();
                    }
                }
            }
            //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input...)
        options.rules.forEach(function(rule) {

            //Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                //Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                //Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            }
        });
    }
}
//Định nghĩa các rules
Validator.isRequired = function(selector, message) { //nhận được tham số đó khi return 
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    };
}

Validator.isConfirmed = function(selector, getCofirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getCofirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}