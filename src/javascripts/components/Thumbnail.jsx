import React from 'react'

export default
class Thumbnail extends React.Component{
  constructor($program, type, numOf$programs, currentIndex) {
    super();
    this.state = {
      thumbnailUrl: null,
      background: null,
      title: null,
      url: null,
      id: null,
      isReserved: null,
      tooltip: null,
      day: ''
    };
    if (type === 'user') {

    }
  }

  setParamsAsUser($program) {
    this.setState({thumbnailUrl: $program.find('community thumbnail').text()});
    this.setState({background: `url('${this.state.thumbnailUrl}'`});
    this.setState({title: $program.find('video title').text()});
    this.setState({id: $program.find('video id').text()});
    this.setState({url: `http://live.nicovideo.jp/watch/${id}`});
    this.setState({isReserved: isReserved($program)});
    if (this.state.isReserved) {
      const startDayJpn = program.find('video open_time_jpstr').text().match(/\d+\/(\d+)/)[1]; // Month/Day(Date) ...
      const startDateJpn = program.find('video open_time_jpstr').text().match(/\d+\/\d+\((.)\)/)[1];
      this.setState({day: `${startDayJpn}(${startDateJpn})`});
      const wrappedTitle = Common.wordWrap(this.state.title, charPerLine);
      const startTimeInfo = `
        &lt;span style="color:#adff2f"&gt;
          ${program.find('video open_time_jpstr').text()}
        &lt;/span&gt;&lt;br&gt;
      `;
      this.setState({tooltip: startTimeInfo + tooltipText});
    }
  }

  setParamsAsOfficial($program) {
    const communityId = $program.find('.video_text a').attr('href');
    const regexp = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
    const resultarr = regexp.exec(communityId);
    let   thumbnailUrl = null;
    if (resultarr != null) {
      thumbnailUrl = `http://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
    } else {
      thumbnailUrl = $program.find('.info a img').attr('src');
    }
    this.setState({thumbnailUrl: thumbnailUrl});
    this.setState({background: `url('${thumbnailUrl}'`});
    this.setState({title: $program.find('.video_title').text()});
    this.setState({id: `lv${$program.find('.video_id').text()}`});
    this.setState({url: `http://live.nicovideo.jp/watch/${id}`});
  }

  setTooltip($program) {
    $.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];
    $dom.data('powertip', tooltipText);
    $dom.powerTip({
      smartPlacement: true,
      fadeInTime: 30,
      fadeOutTime: 30,
      closeDelay: 0,
      intentPollInterval: 0
    });

    if (programType == 'official') {
      // TODO: Fix.
      const hasManyCasts = numOfPrograms > 35;
      const isTopRow = currentIndex < 5;
      const theOffset = (hasManyCasts && !isTopRow) ? -219 : 10;
      const theSmartPlacement = currentIndex < 5 ? false : true;

      // TODO: Fix.
      const manualPositions = ['se', 's', 's', 's', 'sw'];
      const thePlacement = (currentIndex < 5) ? manualPositions[currentIndex] : 'n';

      // TODO: Fix.
      $.fn.powerTip.smartPlacementLists.n = ['n', 's', 'ne', 'nw', 'e', 'w', 'n'];

      // TODO: Fix.
      $dom.powerTip({
        smartPlacement: theSmartPlacement,
        placement: thePlacement,
        fadeInTime: 30,
        fadeOutTime: 30,
        closeDelay: 0,
        intentPollInterval: 0,
        offset: theOffset
      });
    }
  }

  isReserved($program){
    const is_reserved = $($info).find('video is_reserved').text();
    return is_reserved == 'true';
  }

  render(){
    const style = {
      'background-image': background
    };
    return (
      <div className="community-hover-wrapper" data-powertip={this.state.tooltip}>
  			<div className={"side-corner-tag " + (this.props.isReserved ? 'enabled' : 'disabled')}>
  				<div className="community">
  					<a href={this.state.url} target="_blank">
  						<span className="thumbnail"></span>
  					</a>
  				</div>
  				<p><span className="reserved-message">{this.state.day}</span></p>
  			</div>
  		</div>
    );
  }
}

ReactDom.render(
  <Thumbnail />,
  document.getElementById('container')
);
