function area = processArea(aDat)

area = struct;



% generate the mask
area.mask = aDat(:,:,1)==255;

% pull the data
area.data = aDat(:,:,2);