function area = processAreaRet(name,aDat,params,ranges)

area = struct;
area.name = name;
area.ranges = ranges;

% generate the mask
area.mask = aDat.x(:,:,1)==255;

% pull the data
for pi = 1:length(params)
    dat = aDat.(params{pi});
    dat = dat(:,:,2);
    sz = size(dat);
    temp = reshape(interp1([0 128 255],ranges.x,single(dat(:))),sz);
    temp(area.mask) = nan;
    area.(params{pi}) = temp;
end
