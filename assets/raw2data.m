%% Setup
addpath(genpath(pwd));

info = struct;

info.raw = '~/proj/brain/assets/raw';

% Retinotopic areas
% --
% Parameters
%  x: The retinotopic x location 
%  y: The retinotopic y location 
%  sd: Gaussian SD for response
info.ret = struct;
info.ret.parameters = {'x','y','sd'};
info.ret.filetype = 'png';
info.ret.areas = {'MT'};
% define ranges (what value 0 128 255 correspond to)
info.ret.range.x = [-25 0 25];
info.ret.range.y = [-25 0 25];
info.ret.range.sd = [0 12.5 25];

%% Load the raw files

% Get the areas defined by retinotopy
iret = info.ret;

for ai = 1:length(iret.areas)
    cArea = iret.areas{ai};
    clear dat
    for pi = 1:length(iret.parameters)
        fName = fullfile(info.raw,cArea,sprintf('%s.%s',iret.parameters{pi},iret.filetype));
        dat.(iret.parameters{pi}) = imread(fName);
    end
    info.ret.areas{ai} = processAreaRet(cArea,dat,iret.parameters,iret.range);
end

%% Parse all data into one matrix

%% Convert to binary format

%% Save

