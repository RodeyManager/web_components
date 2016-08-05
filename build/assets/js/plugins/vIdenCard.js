
!(function(){

    /**
     * 验证身份证
     * @param idenCard 身份证号码
     * @returns Boolean
     */
    function vIdenCard(idenCard){
        var v_regstr = '',
            v_sum = 0,
            v_mod = 0,
            v_checkcode = '10X98765432',
            v_checkbit = '',
            year = 0;

        if(!idenCard || '' == idenCard || idenCard.length == 0) return !!0;

        if(idenCard.length === 15){
            year = toInt(idenCard.substr(6, 2)) + 1900;
            if(isLeapYear(year)){
                v_regstr = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;
            }else{
                v_regstr = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;
            }
            return v_regstr.test(idenCard);
        }
        else if(idenCard.length === 18){
            year = toInt(idenCard.substr(6, 4));
            if(isLeapYear(year)){
                v_regstr = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;
            }else{
                v_regstr = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;
            }
            if(v_regstr.test(idenCard)){
                v_sum =
                    ( toInt(idenCard[0]) + toInt(idenCard[10]) ) * 7 +
                    ( toInt(idenCard[1]) + toInt(idenCard[11]) ) * 9 +
                    ( toInt(idenCard[2]) + toInt(idenCard[12]) ) * 10 +
                    ( toInt(idenCard[3]) + toInt(idenCard[13]) ) * 5 +
                    ( toInt(idenCard[4]) + toInt(idenCard[14]) ) * 8 +
                    ( toInt(idenCard[5]) + toInt(idenCard[15]) ) * 4 +
                    ( toInt(idenCard[6]) + toInt(idenCard[16]) ) * 2 +
                    toInt(idenCard[7]) * 1 +
                    toInt(idenCard[8]) * 6 +
                    toInt(idenCard[9]) * 3;

                v_mod = v_sum % 11;
                v_checkbit = v_checkcode[v_mod];
                return v_checkbit === idenCard[17].toUpperCase() ? !!1 : !!0;
            }else{
                return !!0;
            }
        }else{
            return !!0;
        }
    }
    //判断润年
    function isLeapYear(year){
        return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
    }
    function toInt(val){
        return parseInt(val, 10);
    }

    //console.log(vIdenCard('362422198812013019'));

    //提取生日
    function getBirthday(card){
        if(!vIdenCard(card))    return '';
        return getYear(card) + '-' + getMonth(card) + '-' + getDate(card);
    }
    function getYear(card){
        if(!vIdenCard(card))    return '';
        if(card.length === 15){
            return toInt(card.substr(6, 2)) + 1900;
        }else if(card.length === 18){
            return card.substr(6, 4);
        }else{
            return '';
        }
    }
    function getMonth(card){
        if(!vIdenCard(card))    return '';
        if(card.length === 15){
            return card.substr(8, 2);
        }else if(card.length === 18){
            return card.substr(10, 2);
        }else{
            return '';
        }
    }
    function getDate(card){
        if(!vIdenCard(card))    return '';
        if(card.length === 15){
            return card.substr(10, 2);
        }else if(card.length === 18){
            return card.substr(12, 2);
        }else{
            return '';
        }
    }
    //提取性别  cn是否输出中文
    function getSex(card, cn){
        if(!vIdenCard(card))    return null;
        var sex;
        if(card.length === 15){
            sex = toInt(card.substr(14, 1), 10) % 2 === 1 ? 1 : 2;
        }else if(card.length === 18){
            sex = toInt(card.substr(16, 1), 10) % 2 === 1 ? 1 : 2;
        }
        cn && (sex = sex === 1 ? '男' : '女');
        return sex;
    }


    //this.vIdenCard = vIdenCard;
    this.IdenCard = {
        vIdenCard: vIdenCard,
        getBirthday: getBirthday,
        getYear: getYear,
        getMonth: getMonth,
        getDate: getDate,
        getSex: getSex
    }

}).call(this);
