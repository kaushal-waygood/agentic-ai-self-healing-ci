import PropTypes from 'prop-types';
import { Icon as IconifyIcon } from '@iconify/react';

export function Iconify({ icon, width = 20, sx }) {
  return (
    <IconifyIcon icon={icon} width={width} style={sx} />
  );
}

Iconify.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  sx: PropTypes.object,
  width: PropTypes.number,
};
